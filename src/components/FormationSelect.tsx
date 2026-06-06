import { motion } from 'framer-motion'

interface FormationSelectProps {
  onSelect: (name: string) => void
  selectedName?: string
}

const FORMATIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2', '4-5-1']

function FormationPitch({ name }: { name: string }) {
  // Simple dot-based pitch diagram
  const dots: Record<string, { x: number; y: number; label: string }[]> = {
    '4-3-3': [
      { x: 50, y: 90, label: 'GK' },
      { x: 20, y: 70, label: 'D' }, { x: 40, y: 70, label: 'D' }, { x: 60, y: 70, label: 'D' }, { x: 80, y: 70, label: 'D' },
      { x: 30, y: 45, label: 'M' }, { x: 50, y: 45, label: 'M' }, { x: 70, y: 45, label: 'M' },
      { x: 20, y: 20, label: 'F' }, { x: 50, y: 15, label: 'F' }, { x: 80, y: 20, label: 'F' },
    ],
    '4-4-2': [
      { x: 50, y: 90, label: 'GK' },
      { x: 20, y: 70, label: 'D' }, { x: 40, y: 70, label: 'D' }, { x: 60, y: 70, label: 'D' }, { x: 80, y: 70, label: 'D' },
      { x: 20, y: 45, label: 'M' }, { x: 40, y: 45, label: 'M' }, { x: 60, y: 45, label: 'M' }, { x: 80, y: 45, label: 'M' },
      { x: 35, y: 20, label: 'F' }, { x: 65, y: 20, label: 'F' },
    ],
    '4-2-3-1': [
      { x: 50, y: 90, label: 'GK' },
      { x: 20, y: 70, label: 'D' }, { x: 40, y: 70, label: 'D' }, { x: 60, y: 70, label: 'D' }, { x: 80, y: 70, label: 'D' },
      { x: 40, y: 55, label: 'M' }, { x: 60, y: 55, label: 'M' },
      { x: 25, y: 35, label: 'F' }, { x: 50, y: 30, label: 'F' }, { x: 75, y: 35, label: 'F' },
      { x: 50, y: 15, label: 'F' },
    ],
    '3-5-2': [
      { x: 50, y: 90, label: 'GK' },
      { x: 30, y: 70, label: 'D' }, { x: 50, y: 70, label: 'D' }, { x: 70, y: 70, label: 'D' },
      { x: 15, y: 50, label: 'M' }, { x: 32, y: 45, label: 'M' }, { x: 50, y: 45, label: 'M' }, { x: 68, y: 45, label: 'M' }, { x: 85, y: 50, label: 'M' },
      { x: 35, y: 20, label: 'F' }, { x: 65, y: 20, label: 'F' },
    ],
    '5-3-2': [
      { x: 50, y: 90, label: 'GK' },
      { x: 15, y: 70, label: 'D' }, { x: 32, y: 70, label: 'D' }, { x: 50, y: 70, label: 'D' }, { x: 68, y: 70, label: 'D' }, { x: 85, y: 70, label: 'D' },
      { x: 30, y: 45, label: 'M' }, { x: 50, y: 45, label: 'M' }, { x: 70, y: 45, label: 'M' },
      { x: 35, y: 20, label: 'F' }, { x: 65, y: 20, label: 'F' },
    ],
    '4-5-1': [
      { x: 50, y: 90, label: 'GK' },
      { x: 20, y: 70, label: 'D' }, { x: 40, y: 70, label: 'D' }, { x: 60, y: 70, label: 'D' }, { x: 80, y: 70, label: 'D' },
      { x: 15, y: 45, label: 'M' }, { x: 32, y: 45, label: 'M' }, { x: 50, y: 45, label: 'M' }, { x: 68, y: 45, label: 'M' }, { x: 85, y: 45, label: 'M' },
      { x: 50, y: 20, label: 'F' },
    ],
  }

  const formationDots = dots[name] || []

  return (
    <div className="relative w-full aspect-[3/4] bg-green-900/40 rounded-lg border border-white/10 overflow-hidden">
      {/* Pitch lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[90%] h-[90%] border border-white/20 rounded-sm relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[15%] border-x border-b border-white/20" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[15%] border-x border-t border-white/20" />
          <div className="absolute top-1/2 left-0 right-0 border-t border-white/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white/20" />
        </div>
      </div>
      {/* Dots */}
      {formationDots.map((dot, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
        />
      ))}
    </div>
  )
}

export function FormationSelect({ onSelect, selectedName }: FormationSelectProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-white text-center">Choose Formation</h2>
      <div className="grid grid-cols-2 gap-3">
        {FORMATIONS.map((name) => (
          <motion.button
            key={name}
            onClick={() => onSelect(name)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={[
              'flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors',
              selectedName === name
                ? 'border-white/40 bg-white/10'
                : 'border-white/10 bg-white/[0.03] hover:border-white/20',
            ].join(' ')}
          >
            <FormationPitch name={name} />
            <span className="text-sm font-semibold text-white">{name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
