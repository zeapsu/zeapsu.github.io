import { useEffect, useState } from 'react'
import { StartScreen } from './ui/StartScreen'
import { CharacterSelect } from './ui/CharacterSelect'
import { Panels } from './ui/Panels'
import { StaticFallback } from './ui/Sections'
import { WorldCanvas, type Stage } from './three/WorldCanvas'
import { webglOk } from './three/quality'
import { isJobId, type JobId } from './content/jobs'

// Full experience per the redesign spec + craft amendment: a TLOU-style
// start screen precedes the gate; the select screen always shows next (the
// last-played job is only pre-highlighted, never auto-equipped); equipping
// re-themes the site over the persistent world canvas.
// ?plain=1 is the ungated plain-text path (recruiter hatch, a11y, no-WebGL).

function rememberedJob(): JobId | null {
  try {
    const v = localStorage.getItem('job')
    return isJobId(v) ? v : null
  } catch {
    return null
  }
}

const reducedMotion =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

const webgl = typeof document !== 'undefined' && webglOk()

export default function App() {
  const [stage, setStage] = useState<Stage>('start')
  const [job, setJob] = useState<JobId | null>(null)
  const equipped = stage === 'equipped' ? job : null

  useEffect(() => {
    document.documentElement.dataset.job = equipped ?? ''
  }, [equipped])

  if (new URLSearchParams(location.search).has('plain')) return <StaticFallback />

  const equip = (id: JobId) => {
    try {
      localStorage.setItem('job', id)
    } catch {
      /* private mode: remembering is best-effort */
    }
    setJob(id)
    setStage('equipped')
  }

  return (
    <>
      <div className="world-placeholder" aria-hidden="true" />
      {webgl && <WorldCanvas stage={stage} job={equipped} reduced={reducedMotion} />}
      {stage === 'start' && <StartScreen onAdvance={() => setStage('select')} />}
      {stage === 'select' && <CharacterSelect onEquip={equip} remembered={rememberedJob()} />}
      <Panels job={equipped} />
    </>
  )
}
