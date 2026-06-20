import { useEffect, useRef, useState } from "react";
import { animate } from "motion";

// Animated number that counts up to `value` when it changes.
export default function CountUp({ value, decimals = 0, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const controls = animate(prev.current, target, {
      duration: 0.9,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = target;
    return () => controls.stop();
  }, [value]);
  return <>{prefix}{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}
