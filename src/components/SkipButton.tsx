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

  const badgeText =
    skipsRemaining === 0 ? "NO SKIPS LEFT" : `${skipsRemaining} SKIP${skipsRemaining === 1 ? "" : "S"} REMAINING`;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={[
          "relative rounded-lg border px-4 py-2 font-semibold transition-colors",
          "bg-treble-surface border-treble-gold text-treble-gold",
          isDisabled
            ? "opacity-50 cursor-not-allowed grayscale"
            : "hover:bg-yellow-900/20 cursor-pointer",
        ].join(" ")}
      >
        {badgeText}
      </button>

      <AnimatePresence>
        {flashKey > 0 && (
          <motion.div
            key={flashKey}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-treble-gold/40 font-bold text-white"
          >
            SKIP USED
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
