import { useEffect, useState } from 'react'
import { CharacterSelect } from './ui/CharacterSelect'
import { Panels } from './ui/Panels'
import { StaticFallback } from './ui/Sections'
import { isJobId, type JobId } from './content/jobs'

// Full-gate model per the redesign spec: the select screen always shows
// first; the last-played job is only pre-highlighted, never auto-equipped.
// ?plain=1 is the ungated plain-text path (recruiter hatch, a11y, no-WebGL
// once zones land in phase 3).

function rememberedJob(): JobId | null {
  try {
    const v = localStorage.getItem('job')
    return isJobId(v) ? v : null
  } catch {
    return null
  }
}

export default function App() {
  const [job, setJob] = useState<JobId | null>(null)

  useEffect(() => {
    document.documentElement.dataset.job = job ?? ''
  }, [job])

  if (new URLSearchParams(location.search).has('plain')) return <StaticFallback />

  const equip = (id: JobId) => {
    try {
      localStorage.setItem('job', id)
    } catch {
      /* private mode: remembering is best-effort */
    }
    setJob(id)
  }

  return (
    <>
      <div className="world-placeholder" aria-hidden="true" />
      {job === null && <CharacterSelect onEquip={equip} remembered={rememberedJob()} />}
      <Panels job={job} />
    </>
  )
}
