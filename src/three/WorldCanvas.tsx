// Persistent world layer behind all UI. The frozen deep runs from first paint
// (start screen) through the gate; equipping a job swaps to that job's world.
// Jobs whose world is not built yet fall to the themed CSS gradient (App gates
// the whole canvas mount on that, which also avoids the R3F freeze from
// unmounting EffectComposer inside a live Canvas).
import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { FrozenDeep } from './worlds/FrozenDeep'
import { Sanctum } from './worlds/Sanctum'
import { DevRoom } from './worlds/DevRoom'
import { Workbench } from './worlds/Workbench'
import { bloomOk, composerSamples, maxDpr } from './quality'
import { JOBS, type JobId } from '../content/jobs'

// Jobs with a built R3F world. Others render the themed CSS gradient.
export const WORLDS_BUILT: JobId[] = ['physicist', 'ai-systems', 'swe', 'robotics']

// Each world defaults to the equipped job's aurora; previewing another job on
// the gate re-lights the entry world toward that job's colors.
function auroraFor(job: JobId | null): { up: string; down: string } {
  const j = job && JOBS.find((x) => x.id === job)
  return j ? j.aurora : JOBS[0].aurora
}

export type Stage = 'start' | 'select' | 'equipped'

interface Framing {
  pos: THREE.Vector3
  look: THREE.Vector3
}

// gate framings ride on the entry world (frozen deep)
const GATE_FRAMINGS: Record<'start' | 'select', Framing> = {
  start: { pos: new THREE.Vector3(4.5, 2.0, 25), look: new THREE.Vector3(-3, 7.5, -22) },
  select: { pos: new THREE.Vector3(0, 3.6, 22), look: new THREE.Vector3(0, 4.4, -18) },
}

// each world's equipped framing (panels scroll over it)
const EQUIPPED_FRAMING: Record<string, Framing> = {
  physicist: { pos: new THREE.Vector3(0, 5.0, 19), look: new THREE.Vector3(0, 4.0, -20) },
  'ai-systems': { pos: new THREE.Vector3(0, 6.5, 15), look: new THREE.Vector3(0, 1.5, -13) },
  // close 3/4 from the left: the big rice monitor fills the right of frame,
  // legible, desk and tower in the foreground, panels over the darker left
  swe: { pos: new THREE.Vector3(-6.5, 5.2, 2), look: new THREE.Vector3(2.5, 4.8, -9) },
  // 3/4 from the front-left: the IK arm reaches across center, bench grid
  // recedes, ghost part and dev board sit right, panels over the darker left
  robotics: { pos: new THREE.Vector3(-6.5, 4.2, 4.5), look: new THREE.Vector3(2.4, 4.6, -9) },
}

function framingFor(stage: Stage, job: JobId | null): Framing {
  if (stage === 'start') return GATE_FRAMINGS.start
  if (stage === 'select') return GATE_FRAMINGS.select
  return EQUIPPED_FRAMING[job ?? 'physicist'] ?? EQUIPPED_FRAMING.physicist
}

function CameraRig({ framing, reduced }: { framing: Framing; reduced: boolean }) {
  const base = useRef(framing.pos.clone())
  const look = useRef(framing.look.clone())
  const t = useRef(0)
  useFrame(({ camera }, delta) => {
    if (reduced) {
      base.current.copy(framing.pos)
      look.current.copy(framing.look)
    } else {
      const k = 1 - Math.exp(-delta * 2.0)
      base.current.lerp(framing.pos, k)
      look.current.lerp(framing.look, k)
      t.current += delta
    }
    const dx = reduced ? 0 : Math.sin(t.current * 0.1) * 0.45
    const dy = reduced ? 0 : Math.sin(t.current * 0.073) * 0.22
    camera.position.set(base.current.x + dx, base.current.y + dy, base.current.z)
    camera.lookAt(look.current)
  })
  return null
}

// The entry world (start/select) is always the frozen deep; equipping swaps.
function World({
  stage,
  job,
  up,
  down,
  reduced,
}: {
  stage: Stage
  job: JobId | null
  up: string
  down: string
  reduced: boolean
}) {
  const world = stage === 'equipped' ? job : null
  if (world === 'ai-systems') return <Sanctum frozen={reduced} up={up} down={down} />
  if (world === 'swe') return <DevRoom frozen={reduced} up={up} down={down} />
  if (world === 'robotics') return <Workbench frozen={reduced} up={up} down={down} />
  // null (start/select) and physicist both get the frozen deep
  return <FrozenDeep frozen={reduced} up={up} down={down} />
}

export function WorldCanvas({
  stage,
  job,
  tintJob,
  reduced,
}: {
  stage: Stage
  job: JobId | null
  tintJob: JobId | null
  reduced: boolean
}) {
  const bloom = useMemo(() => bloomOk(), [])
  const aurora = auroraFor(tintJob)
  const framing = framingFor(stage, job)
  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, maxDpr()]}
        camera={{ fov: 50, near: 0.1, far: 160, position: [0, 1.8, 27] }}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ alpha: true }}
      >
        <World stage={stage} job={job} up={aurora.up} down={aurora.down} reduced={reduced} />
        <CameraRig framing={framing} reduced={reduced} />
        {bloom && (
          <EffectComposer multisampling={composerSamples()}>
            <Bloom luminanceThreshold={0.55} intensity={0.7} mipmapBlur />
            <Vignette eskil={false} offset={0.18} darkness={0.78} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
