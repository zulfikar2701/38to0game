// Simple verbose logger for development debugging
// Enable by adding VITE_DEBUG=true to your .env.local file
// Or toggle in browser console: localStorage.setItem('debug', '1')

const isDebug =
  import.meta.env.VITE_DEBUG === 'true' ||
  localStorage.getItem('debug') === '1'

export const log = {
  enabled: isDebug,

  flow(label: string, data?: unknown) {
    if (!isDebug) return
    console.log(`[FLOW] ${label}`, data ?? '')
  },

  store(action: string, state: Record<string, unknown>) {
    if (!isDebug) return
    console.group(`[STORE] ${action}`)
    Object.entries(state).forEach(([k, v]) => {
      if (v instanceof Set) {
        console.log(`  ${k}: Set(${v.size}) {${[...v].slice(0, 5).join(', ')}${v.size > 5 ? '...' : ''}}`)
      } else if (Array.isArray(v)) {
        console.log(`  ${k}: Array(${v.length})`)
      } else {
        console.log(`  ${k}:`, v)
      }
    })
    console.groupEnd()
  },

  draft(slotLabel: string, pack: unknown[]) {
    if (!isDebug) return
    console.group(`[DRAFT] Slot ${slotLabel}`)
    console.log(`  Pack (${pack.length} cards):`)
    pack.forEach((card: any, i) => {
      console.log(`    ${i + 1}. ${card.player?.name} | OVR ${card.player?.ovr} | ${card.tier}`)
    })
    console.groupEnd()
  },

  sim(label: string, data?: unknown) {
    if (!isDebug) return
    console.log(`[SIM] ${label}`, data ?? '')
  },

  squad(squad: unknown[]) {
    if (!isDebug) return
    console.group('[SQUAD]')
    ;(squad as any[]).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (${p.role}) | OVR ${p.ovr} | ${p.tier} | ${p.club}`)
    })
    console.groupEnd()
  },

  match(opponent: string, userGoals: number, oppGoals: number, result: string) {
    if (!isDebug) return
    console.log(`[MATCH] ${userGoals}-${oppGoals} ${result} vs ${opponent}`)
  },

  results(quadruple: any) {
    if (!isDebug) return
    console.group('[RESULTS] Quadruple')
    console.log('  Community Shield:', quadruple.communityShield.won ? 'WON' : 'LOST', quadruple.communityShield.scoreline)
    console.log('  Premier League:', quadruple.premierLeague.won ? 'CHAMPIONS' : `${quadruple.premierLeague.roundReached}`, quadruple.premierLeague.scoreline ?? '')
    console.log('  FA Cup:', quadruple.faCup.won ? 'WON' : 'LOST', `(${quadruple.faCup.roundReached})`, quadruple.faCup.scoreline)
    console.log('  Champions League:', quadruple.championsLeague.won ? 'WON' : 'LOST', `(${quadruple.championsLeague.roundReached})`, quadruple.championsLeague.scoreline)
    console.log('  Trophies:', quadruple.trophies)
    console.log('  Headline:', quadruple.headline)
    console.groupEnd()
  },
}
