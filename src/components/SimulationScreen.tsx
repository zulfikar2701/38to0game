import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SimulationResult } from "../types/game";
import { TrophyReveal } from "./TrophyReveal";

interface SimulationScreenProps {
  result: SimulationResult;
  onComplete: () => void;
}

export function SimulationScreen({ result, onComplete }: SimulationScreenProps) {
  const [showResult, setShowResult] = useState(false);

  const wins = [result.league, result.domesticCup, result.continentalCup].filter(
    Boolean
  ).length;

  let resultText: string;
  let resultColorClass: string;

  switch (wins) {
    case 3:
      resultText = "TREBLE!";
      resultColorClass = "text-treble-gold";
      break;
    case 2:
      resultText = "DOUBLE!";
      resultColorClass = "text-green-500";
      break;
    case 1:
      resultText = "SINGLE TROPHY";
      resultColorClass = "text-blue-400";
      break;
    default:
      resultText = "NO TROPHIES";
      resultColorClass = "text-gray-400";
      break;
  }

  useEffect(() => {
    const resultTimer = setTimeout(() => {
      setShowResult(true);
    }, 3000);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(resultTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-treble-bg px-4 py-8 gap-8">
      {/* Progress bar */}
      <div className="w-full max-w-md h-3 bg-treble-surface rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-treble-gold rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>

      {/* Trophy reveals */}
      <div className="flex items-center justify-center gap-8 md:gap-12">
        <TrophyReveal
          competition="league"
          won={result.league}
          delay={0.2}
        />
        <TrophyReveal
          competition="domesticCup"
          won={result.domesticCup}
          delay={0.5}
        />
        <TrophyReveal
          competition="continentalCup"
          won={result.continentalCup}
          delay={0.8}
        />
      </div>

      {/* Commentary */}
      <div className="flex flex-col items-center gap-2 max-w-lg">
        <AnimatePresence>
          {result.commentary.map((line, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 1.5 + index * 0.3,
                ease: "easeOut",
              }}
              className="text-gray-300 text-center text-sm md:text-base"
            >
              {line}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      {/* Final result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-4"
          >
            <h1
              className={`text-5xl md:text-7xl font-black tracking-wider text-center ${resultColorClass}`}
            >
              {resultText}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
