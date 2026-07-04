import { useEffect, useRef, useState } from 'react'
import { StartScreen } from './ui/StartScreen'
import { CharacterSelect } from './ui/CharacterSelect'
import { Panels } from './ui/Panels'
import { Terminal } from './ui/Terminal'
import { StaticFallback } from './ui/Sections'
import { WorldCanvas, WORLDS_BUILT, type Stage } from './three/WorldCanvas'
import { webglOk } from './three/quality'
import { isJobId, type JobId } from './content/jobs'

// Full experience per the redesign spec + craft amendment: a TLOU-style
// start screen precedes the gate; the select screen always shows next (the
// last-played job is only pre-highlighted, never auto-equipped); equipping
// plays a sub-second transition and re-themes the site over the persistent
// world canvas. Hovering a job on the gate re-lights the WORLD, not just
// the chrome. ?plain=1 is the ungated plain-text path.

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

type Phase = 'start' | 'select' | 'equipping' | 'equipped'

export default function App() {
  const [phase, setPhase] = useState<Phase>('start')
  const [job, setJob] = useState<JobId | null>(null)
  const [preview, setPreview] = useState<JobId | null>(null)
  const equipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const equipped = phase === 'equipping' || phase === 'equipped' ? job : null

  useEffect(() => {
    document.documentElement.dataset.job = equipped ?? ''
  }, [equipped])

  useEffect(() => () => {
    if (equipTimer.current) clearTimeout(equipTimer.current)
  }, [])

  if (new URLSearchParams(location.search).has('plain')) return <StaticFallback />

  const equip = (id: JobId) => {
    try {
      localStorage.setItem('job', id)
    } catch {
      /* private mode: remembering is best-effort */
    }
    setJob(id)
    // switching while already equipped (nameplate/terminal `job <name>`) is
    // an in-place re-theme, never a one-way door: skip the equip transition.
    if (reducedMotion || phase === 'equipped') {
      setPhase('equipped')
    } else {
      setPhase('equipping')
      equipTimer.current = setTimeout(() => setPhase('equipped'), 700)
    }
  }

  const stage: Stage = phase === 'start' ? 'start' : phase === 'select' ? 'select' : 'equipped'
  // the world tints toward the previewed job on the gate, and stays in the
  // equipped job's light afterwards
  const tintJob = phase === 'select' ? preview : equipped

  // Mount the canvas for start/select (entry world) and for any equipped job
  // whose world is built; jobs without a world yet fall to the themed CSS
  // gradient. Showing another job's finished world (e.g. re-lit frozen deep)
  // for a job it does not belong to would be decorative cosplay, which the
  // metaphor rule forbids. Gating the whole canvas -- not the world inside it
  // -- also avoids the R3F freeze from unmounting EffectComposer mid-Canvas.
  const showWorld = equipped === null || WORLDS_BUILT.includes(equipped)

  return (
    <>
      <div className="world-placeholder" aria-hidden="true" />
      {webgl && showWorld && (
        <WorldCanvas stage={stage} job={equipped} tintJob={tintJob} reduced={reducedMotion} />
      )}
      {phase === 'start' && <StartScreen onAdvance={() => setPhase('select')} />}
      {(phase === 'select' || phase === 'equipping') && (
        <CharacterSelect
          onEquip={equip}
          remembered={rememberedJob()}
          preview={preview}
          onPreview={setPreview}
          leaving={phase === 'equipping'}
        />
      )}
      <Panels job={phase === 'equipped' ? job : null} />
      {phase === 'equipped' && <Terminal job={job} equip={equip} />}
    </>
  )
}
