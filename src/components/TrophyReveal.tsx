import { motion } from "framer-motion";

interface TrophyRevealProps {
  competition: "league" | "domesticCup" | "continentalCup";
  won: boolean;
  delay: number;
}

const competitionLabels: Record<TrophyRevealProps["competition"], string> = {
  league: "League",
  domesticCup: "Domestic Cup",
  continentalCup: "Continental Cup",
};

export function TrophyReveal({ competition, won, delay }: TrophyRevealProps) {
  const label = competitionLabels[competition];
  const clipId = `cup-clip-${competition}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative w-20 h-20">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={won ? "" : "grayscale"}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Trophy body outline */}
          <path
            d="M18 10 h28 v4 c0 4 8 6 8 12 c0 6 -4 10 -8 12 c-2 8 -6 12 -10 14 v4 h-8 v-4 c-4 -2 -8 -6 -10 -14 c-4 -2 -8 -6 -8 -12 c0 -6 8 -8 8 -12 v-4 z"
            stroke={won ? "#FFD700" : "#9CA3AF"}
            strokeWidth="2"
            fill="none"
          />

          {/* Base */}
          <rect
            x="20"
            y="56"
            width="24"
            height="4"
            rx="1"
            stroke={won ? "#FFD700" : "#9CA3AF"}
            strokeWidth="2"
            fill="none"
          />

          {/* Gold fill animation (only on win) */}
          {won && (
            <motion.rect
              x="10"
              y="10"
              width="44"
              height="48"
              fill="#FFD700"
              opacity={0.6}
              initial={{ y: 58, height: 0 }}
              animate={{ y: 10, height: 48 }}
              transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeInOut" }}
              clipPath={`url(#${clipId})`}
            />
          )}

          {/* Clip path for cup interior */}
          <defs>
            <clipPath id={clipId}>
              <path d="M19 11 h26 v3 c0 4 7 6 7 11 c0 5 -3 9 -7 11 c-2 7 -5 11 -9 13 v4 h-6 v-4 c-4 -2 -7 -6 -9 -13 c-4 -2 -7 -6 -7 -11 c0 -5 7 -7 7 -11 v-3 z" />
            </clipPath>
          </defs>

          {/* Crack line on loss */}
          {!won && (
            <motion.path
              d="M22 16 l8 12 l-4 8 l6 6 l-2 6"
              stroke="#EF4444"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: delay + 0.5 }}
            />
          )}
        </svg>
      </div>

      <span
        className={`text-sm font-bold uppercase tracking-wide ${
          won ? "text-treble-gold" : "text-gray-400"
        }`}
      >
        {label}
        {!won && (
          <span className="ml-1 text-xs font-semibold text-red-500">
            FAILED
          </span>
        )}
      </span>
    </motion.div>
  );
}
