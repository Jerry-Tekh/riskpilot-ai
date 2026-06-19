"""RiskPilot Adaptive Regime strategy (Nautilus).

Risk-first logic:
  1. Classify the regime from trend strength (fast/slow EMA separation, ATR-normalized):
       - TREND   when |ema_fast - ema_slow| / atr >= trend_threshold
       - RANGE   when |ema_fast - ema_slow| / atr <= range_threshold
       - UNCLEAR otherwise -> stay flat (no new position)
  2. TREND regime: trade WITH direction (momentum alignment).
     RANGE regime: FADE extremes using an RSI oscillator.
  3. Every position gets an ATR-scaled stop-loss and take-profit, plus a
     regime-invalidation exit. The disciplined "do nothing when unclear" branch
     is the differentiator.
"""
from decimal import Decimal
from typing import Optional

from nautilus_trader.config import StrategyConfig
from nautilus_trader.model.data import Bar, BarType
from nautilus_trader.model.enums import OrderSide, TimeInForce
from nautilus_trader.model.identifiers import InstrumentId
from nautilus_trader.model.instruments import Instrument
from nautilus_trader.model.objects import Quantity
from nautilus_trader.trading.strategy import Strategy


class AdaptiveRegimeConfig(StrategyConfig):
    instrument_id: Optional[InstrumentId] = None
    bar_type: Optional[BarType] = None
    instrument_ids: tuple[InstrumentId, ...] = ()
    bar_types: tuple[BarType, ...] = ()
    trade_size: str = "0.01"
    fast_period: int = 12
    slow_period: int = 34
    rsi_period: int = 14
    atr_period: int = 14
    trend_threshold: float = 1.0
    range_threshold: float = 0.4
    rsi_oversold: float = 32.0
    rsi_overbought: float = 68.0
    sl_atr_mult: float = 1.5
    tp_atr_mult: float = 3.0


class AdaptiveRegimeStrategy(Strategy):
    def __init__(self, config: AdaptiveRegimeConfig) -> None:
        super().__init__(config)
        self.cfg = config
        self._closes: list[float] = []
        self._fast_ema: Optional[float] = None
        self._slow_ema: Optional[float] = None
        self._atr: Optional[float] = None
        self._prev_close: Optional[float] = None
        # Wilder RSI running averages
        self._avg_gain: Optional[float] = None
        self._avg_loss: Optional[float] = None
        self._position: str = "NONE"          # NONE | LONG | SHORT
        self._entry_regime: str = "UNCLEAR"   # regime that justified the open
        self._entry_price: Optional[float] = None
        self._stop: Optional[float] = None
        self._target: Optional[float] = None
        self._instrument: Optional[Instrument] = None

    # ----- lifecycle -----
    def on_start(self) -> None:
        bar_type = self.cfg.bar_type or (self.cfg.bar_types[0] if self.cfg.bar_types else None)
        instrument_id = self.cfg.instrument_id or (
            self.cfg.instrument_ids[0] if self.cfg.instrument_ids else None
        )
        if bar_type is None or instrument_id is None:
            raise RuntimeError("bar_type and instrument_id must be set")
        self._instrument = self.cache.instrument(instrument_id)
        self.subscribe_bars(bar_type)

    def on_stop(self) -> None:
        if self._instrument is not None:
            self.cancel_all_orders(self._instrument.id)
            self.close_all_positions(self._instrument.id)

    # ----- indicators -----
    @staticmethod
    def _update_ema(prev: Optional[float], value: float, period: int) -> float:
        if prev is None:
            return value
        alpha = 2.0 / (period + 1)
        return alpha * value + (1.0 - alpha) * prev

    def _update_atr(self, high: float, low: float, close: float) -> None:
        if self._prev_close is None:
            tr = high - low
        else:
            tr = max(high - low, abs(high - self._prev_close), abs(low - self._prev_close))
        period = self.cfg.atr_period
        self._atr = tr if self._atr is None else (self._atr * (period - 1) + tr) / period

    def _update_rsi(self, close: float) -> None:
        if self._prev_close is None:
            return
        change = close - self._prev_close
        gain = max(change, 0.0)
        loss = max(-change, 0.0)
        p = self.cfg.rsi_period
        if self._avg_gain is None:
            self._avg_gain, self._avg_loss = gain, loss
        else:
            self._avg_gain = (self._avg_gain * (p - 1) + gain) / p
            self._avg_loss = (self._avg_loss * (p - 1) + loss) / p

    def _rsi(self) -> Optional[float]:
        if self._avg_gain is None or self._avg_loss is None:
            return None
        if self._avg_loss == 0:
            return 100.0
        rs = self._avg_gain / self._avg_loss
        return 100.0 - 100.0 / (1.0 + rs)

    # ----- main -----
    def on_bar(self, bar: Bar) -> None:
        high, low, close = float(bar.high), float(bar.low), float(bar.close)
        self._closes.append(close)
        self._fast_ema = self._update_ema(self._fast_ema, close, self.cfg.fast_period)
        self._slow_ema = self._update_ema(self._slow_ema, close, self.cfg.slow_period)
        self._update_atr(high, low, close)
        self._update_rsi(close)

        warmup = max(self.cfg.slow_period, self.cfg.atr_period, self.cfg.rsi_period) + 1
        if len(self._closes) < warmup or self._atr is None or self._atr <= 0:
            self._prev_close = close
            return

        instrument = self._instrument
        if instrument is None:
            self._prev_close = close
            return

        # ----- manage an open position first (SL / TP / regime invalidation) -----
        if self._position != "NONE":
            if self._should_exit(close):
                side = OrderSide.SELL if self._position == "LONG" else OrderSide.BUY
                self._close_open(instrument.id, side)
                self._reset_position()
            self._prev_close = close
            return

        # ----- flat: decide whether a regime gives us an edge -----
        regime = self._classify_regime()
        if regime == "UNCLEAR":
            self._prev_close = close
            return  # the disciplined "do nothing" branch

        qty = Quantity(Decimal(self.cfg.trade_size), instrument.size_precision)
        direction = self._signal(regime)
        if direction == OrderSide.BUY:
            self._open(instrument.id, OrderSide.BUY, qty, close, "LONG", regime)
        elif direction == OrderSide.SELL:
            self._open(instrument.id, OrderSide.SELL, qty, close, "SHORT", regime)

        self._prev_close = close

    # ----- decision helpers -----
    def _classify_regime(self) -> str:
        sep = abs(self._fast_ema - self._slow_ema) / self._atr  # type: ignore[operator]
        if sep >= self.cfg.trend_threshold:
            return "TREND"
        if sep <= self.cfg.range_threshold:
            return "RANGE"
        return "UNCLEAR"

    def _signal(self, regime: str) -> Optional[OrderSide]:
        if regime == "TREND":
            # trade with the trend
            if self._fast_ema > self._slow_ema:  # type: ignore[operator]
                return OrderSide.BUY
            return OrderSide.SELL
        # RANGE: fade extremes via RSI
        rsi = self._rsi()
        if rsi is None:
            return None
        if rsi <= self.cfg.rsi_oversold:
            return OrderSide.BUY
        if rsi >= self.cfg.rsi_overbought:
            return OrderSide.SELL
        return None

    def _should_exit(self, close: float) -> bool:
        if self._stop is None or self._target is None:
            return False
        if self._position == "LONG":
            if close <= self._stop or close >= self._target:
                return True
        elif self._position == "SHORT":
            if close >= self._stop or close <= self._target:
                return True
        # regime invalidation: trend flips against an open trend trade
        if self._entry_regime == "TREND":
            if self._position == "LONG" and self._fast_ema < self._slow_ema:  # type: ignore[operator]
                return True
            if self._position == "SHORT" and self._fast_ema > self._slow_ema:  # type: ignore[operator]
                return True
        return False

    # ----- order plumbing -----
    def _open(self, instrument_id, side, qty, price, pos_label, regime) -> None:
        self._submit(instrument_id, side, qty)
        self._position = pos_label
        self._entry_regime = regime
        self._entry_price = price
        sl = self.cfg.sl_atr_mult * self._atr  # type: ignore[operator]
        tp = self.cfg.tp_atr_mult * self._atr  # type: ignore[operator]
        if side == OrderSide.BUY:
            self._stop, self._target = price - sl, price + tp
        else:
            self._stop, self._target = price + sl, price - tp

    def _reset_position(self) -> None:
        self._position = "NONE"
        self._entry_regime = "UNCLEAR"
        self._entry_price = None
        self._stop = None
        self._target = None

    def _submit(self, instrument_id: InstrumentId, side: OrderSide, quantity: Quantity) -> None:
        order = self.order_factory.market(
            instrument_id=instrument_id,
            order_side=side,
            quantity=quantity,
            time_in_force=TimeInForce.GTC,
        )
        self.submit_order(order)

    def _close_open(self, instrument_id: InstrumentId, side: OrderSide) -> None:
        for position in self.cache.positions_open(instrument_id=instrument_id):
            self._submit(instrument_id, side, position.quantity)
