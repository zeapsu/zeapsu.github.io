// The four focuses of the portfolio: one person, four facets. The hero line
// cycles these and doubles as the filter (AI Systems leads — it is the primary
// framing — but the array stays in display order). Taglines are audited against
// ~/Documents/personal/experience.md like all copy.

export type JobId = 'physicist' | 'ai-systems' | 'swe' | 'robotics'

export interface Job {
  id: JobId
  name: string
  tagline: string
  /** drives the single page accent when this focus is the active lens */
  palette: { accent: string; accentDim: string }
}

export const JOBS: Job[] = [
  {
    id: 'physicist',
    name: 'Physicist',
    tagline: 'Quantum information and computational physics, from QAOA portfolio benchmarks to condensate simulations.',
    palette: { accent: '#4fd8c8', accentDim: '#1e6f8f' },
  },
  {
    id: 'ai-systems',
    name: 'AI Systems Engineer',
    tagline: 'Agents, local inference, and edge hardware I can point at.',
    palette: { accent: '#b48cff', accentDim: '#6b4a9e' },
  },
  {
    id: 'swe',
    name: 'Research SWE',
    tagline: 'Verification first: tests re-run, diffs read, apps driven.',
    palette: { accent: '#f0a848', accentDim: '#9a6a2a' },
  },
  {
    id: 'robotics',
    name: 'Robotics Engineer',
    tagline: 'Physical AI: putting intelligence on edge devices and robots.',
    palette: { accent: '#ff7a45', accentDim: '#9e4a26' },
  },
]

// The primary focus: leads the hero cycle and is the default page accent.
export const PRIMARY_JOB: JobId = 'ai-systems'

export function isJobId(v: string | null): v is JobId {
  return v !== null && JOBS.some((j) => j.id === v)
}
