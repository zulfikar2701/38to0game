import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SkipButtonProps {
  skipsRemaining: number;
  onSkip: () => void;
  disabled: boolean;
}

export function SkipButton({ skipsRemaining, onSkip, disabled }: SkipButtonProps) {
  const [flashKey, setFlashKey] = useState<number>(0);

  const isDisabled = disabled || skipsRemaining === 0;

  const handleClick = useCallback(() => {
    if (isDisabled) return;
    onSkip();
    setFlashKey((prev) => prev + 1);
  }, [isDisabled, onSkip]);

  const label = skipsRemaining === 0 ? "No skips" : `${skipsRemaining} skip${skipsRemaining === 1 ? "" : "s"}`;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={[
          "relative rounded border px-3 py-1.5 text-xs font-medium transition-colors",
          "border-38-border text-38-muted",
          isDisabled
            ? "opacity-40 cursor-not-allowed"
            : "hover:border-white/30 hover:text-white cursor-pointer",
        ].join(" ")}
      >
        {label}
      </button>

      <AnimatePresence>
        {flashKey > 0 && (
          <motion.div
            key={flashKey}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-white/10 text-[10px] font-medium text-white"
          >
            Skipped
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
