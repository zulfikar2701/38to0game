import { useRef } from 'react'
import html2canvas from 'html2canvas'
import type { Formation, SimulationResult } from '../types/game'

interface ShareCardProps {
  formation: Formation
  result: SimulationResult
}

const POSITION_COLORS: Record<string, string> = {
  GK: '#A855F7',
  DEF: '#3B82F6',
  MID: '#22C55E',
  FWD: '#EF4444',
}

const POSITION_LABELS: Record<string, string> = {
  GK: 'GK',
  DEF: 'DEF',
  MID: 'MID',
  FWD: 'FWD',
}

function getFinalResult(result: SimulationResult): { text: string; color: string } {
  const wins = [result.league, result.domesticCup, result.continentalCup].filter(Boolean).length
  switch (wins) {
    case 3:
      return { text: 'TREBLE!', color: '#FFD700' }
    case 2:
      return { text: 'DOUBLE!', color: '#22C55E' }
    case 1:
      return { text: 'SINGLE TROPHY', color: '#60A5FA' }
    default:
      return { text: 'NO TROPHIES', color: '#9CA3AF' }
  }
}

function TrophyIcon({ filled, size = 32 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 10 h28 v4 c0 4 8 6 8 12 c0 6 -4 10 -8 12 c-2 8 -6 12 -10 14 v4 h-8 v-4 c-4 -2 -8 -6 -10 -14 c-4 -2 -8 -6 -8 -12 c0 -6 8 -8 8 -12 v-4 z"
        stroke={filled ? '#FFD700' : '#9CA3AF'}
        strokeWidth="2"
        fill={filled ? '#FFD700' : 'none'}
      />
      <rect
        x="20"
        y="56"
        width="24"
        height="4"
        rx="1"
        stroke={filled ? '#FFD700' : '#9CA3AF'}
        strokeWidth="2"
        fill={filled ? '#FFD700' : 'none'}
      />
    </svg>
  )
}

export function ShareCard({ formation, result }: ShareCardProps) {
  const hiddenDivRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!hiddenDivRef.current) return
    const canvas = await html2canvas(hiddenDivRef.current, {
      backgroundColor: '#0B0F19',
      scale: 2,
    })
    const link = document.createElement('a')
    link.download = 'treble-draft-result.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const finalResult = getFinalResult(result)

  const competitions = [
    { label: 'League', won: result.league },
    { label: 'Domestic Cup', won: result.domesticCup },
    { label: 'Continental Cup', won: result.continentalCup },
  ]

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Visible Preview */}
      <div className="w-full max-w-md bg-treble-bg border border-treble-gold/30 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-treble-gold text-center mb-4">
          Treble Draft
        </h2>

        <div className="space-y-1 mb-4">
          {formation.map((slot, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span
                className="font-bold w-8"
                style={{ color: POSITION_COLORS[slot.position] }}
              >
                {POSITION_LABELS[slot.position]}
              </span>
              <span className="text-white">{slot.player?.name ?? '—'}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-6 mb-4">
          {competitions.map((comp) => (
            <div key={comp.label} className="flex flex-col items-center gap-1">
              <TrophyIcon filled={comp.won} />
              <span className="text-xs text-gray-300">{comp.label}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <span
            className="text-xl font-bold"
            style={{ color: finalResult.color }}
          >
            {finalResult.text}
          </span>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="px-6 py-2 bg-treble-gold text-treble-bg font-bold rounded-lg hover:bg-yellow-300 transition-colors cursor-pointer"
      >
        Download Card
      </button>

      {/* Hidden Capture Div */}
      <div
        ref={hiddenDivRef}
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '600px',
          padding: '32px',
          backgroundColor: '#0B0F19',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          borderRadius: '16px',
          border: '1px solid rgba(255, 215, 0, 0.3)',
        }}
      >
        <h2
          style={{
            color: '#FFD700',
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          Treble Draft
        </h2>

        <div style={{ marginBottom: '24px' }}>
          {formation.map((slot, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '6px 0',
                fontSize: '16px',
              }}
            >
              <span
                style={{
                  fontWeight: 'bold',
                  width: '40px',
                  color: POSITION_COLORS[slot.position],
                }}
              >
                {POSITION_LABELS[slot.position]}
              </span>
              <span style={{ color: '#ffffff' }}>
                {slot.player?.name ?? '—'}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            marginBottom: '24px',
          }}
        >
          {competitions.map((comp) => (
            <div
              key={comp.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <TrophyIcon filled={comp.won} size={40} />
              <span style={{ color: '#d1d5db', fontSize: '14px' }}>
                {comp.label}
              </span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <span
            style={{
              color: finalResult.color,
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            {finalResult.text}
          </span>
        </div>
      </div>
    </div>
  )
}
