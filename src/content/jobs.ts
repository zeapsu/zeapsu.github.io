// The four jobs of the character-select conceit (spec:
// docs/superpowers/specs/2026-07-02-character-select-redesign-design.md).
// Taglines are audited against ~/Documents/personal/experience.md like all copy.

export type JobId = 'physicist' | 'ai-systems' | 'swe' | 'robotics'

export interface Job {
  id: JobId
  name: string
  subtitle: string
  /** 1-4 pips; honest: robotics is genuinely leveling. */
  level: 1 | 2 | 3 | 4
  tagline: string
  palette: { accent: string; accentDim: string; bg0: string; bg1: string }
  /** world re-light on gate hover: spin-up / spin-down aurora colors */
  aurora: { up: string; down: string }
}

export const JOBS: Job[] = [
  {
    id: 'physicist',
    name: 'Physicist',
    subtitle: 'the Scholar',
    level: 4,
    tagline: 'Quantum information and computational physics, from QAOA portfolio benchmarks to condensate simulations.',
    palette: { accent: '#4fd8c8', accentDim: '#1e6f8f', bg0: '#061018', bg1: '#0a1c28' },
    aurora: { up: '#4fd8c8', down: '#f0a848' },
  },
  {
    id: 'ai-systems',
    name: 'AI Systems Engineer',
    subtitle: 'the Summoner',
    level: 4,
    tagline: 'Agents, local inference, and edge hardware I can point at.',
    palette: { accent: '#b48cff', accentDim: '#6b4a9e', bg0: '#0d0a1a', bg1: '#161028' },
    aurora: { up: '#b48cff', down: '#5fb8e8' },
  },
  {
    id: 'swe',
    name: 'Research SWE',
    subtitle: 'the Artificer',
    level: 3,
    tagline: 'Verification first: tests re-run, diffs read, apps driven.',
    palette: { accent: '#f0a848', accentDim: '#9a6a2a', bg0: '#120e08', bg1: '#1e1810' },
    aurora: { up: '#f0a848', down: '#4fd8c8' },
  },
  {
    id: 'robotics',
    name: 'Roboticist',
    subtitle: 'the Automaton',
    level: 1,
    tagline: 'Currently leveling: a Reachy Mini living on a Jetson Orin Nano.',
    palette: { accent: '#ff7a45', accentDim: '#9e4a26', bg0: '#120806', bg1: '#20100a' },
    aurora: { up: '#ff7a45', down: '#e8c85f' },
  },
]

export function isJobId(v: string | null): v is JobId {
  return v !== null && JOBS.some((j) => j.id === v)
}
