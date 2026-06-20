import { motion } from "motion/react";

// Staggered fade-up entrance. Wrap any block; optional `i` for stagger delay.
export default function Reveal({ children, i = 0, y = 14, className, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
