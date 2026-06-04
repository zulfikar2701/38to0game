export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Crown */}
      <path
        d="M50 55 L70 35 L85 50 L100 30 L115 50 L130 35 L150 55 L140 70 L60 70 Z"
        fill="white"
        opacity="0.9"
      />
      {/* Lion head silhouette */}
      <path
        d="M100 75
           C85 75, 70 85, 65 100
           C60 115, 62 130, 70 140
           C75 148, 85 152, 100 152
           C115 152, 125 148, 130 140
           C138 130, 140 115, 135 100
           C130 85, 115 75, 100 75Z"
        fill="white"
        opacity="0.95"
      />
      {/* Mane */}
      <path
        d="M100 68
           C110 68, 120 72, 128 80
           C135 88, 138 100, 135 112
           C140 108, 145 100, 142 92
           C138 80, 128 72, 118 68
           C125 65, 130 60, 128 55
           C125 50, 118 52, 112 58
           C108 54, 104 52, 100 52
           C96 52, 92 54, 88 58
           C82 52, 75 50, 72 55
           C70 60, 75 65, 82 68
           C72 72, 62 80, 58 92
           C55 100, 60 108, 65 112
           C62 100, 65 88, 72 80
           C80 72, 90 68, 100 68Z"
        fill="white"
        opacity="0.7"
      />
      {/* Eyes */}
      <circle cx="88" cy="105" r="3" fill="#0A0E17" />
      <circle cx="112" cy="105" r="3" fill="#0A0E17" />
      {/* Nose */}
      <path
        d="M96 118 L100 122 L104 118 Z"
        fill="#0A0E17"
      />
      {/* 38-0 text on chest */}
      <text
        x="100"
        y="142"
        textAnchor="middle"
        fill="#0A0E17"
        fontSize="14"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        38-0
      </text>
    </svg>
  )
}
