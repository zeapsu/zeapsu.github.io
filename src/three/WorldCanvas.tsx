// Persistent world layer behind all UI. The frozen deep runs from first
// paint (start screen) through the gate and the equipped Physicist; other
// jobs fall through to the themed CSS gradient until their worlds land.
import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { FrozenDeep } from './worlds/FrozenDeep'
import { bloomOk, composerSamples, maxDpr } from './quality'
import { JOBS, type JobId } from '../content/jobs'

// The frozen deep is the Physicist's own world, so its default light is the
// Physicist aurora; previewing another job on the gate re-lights toward that
// job's colors even before its dedicated world exists.
function auroraFor(job: JobId | null): { up: string; down: string } {
  const j = job && JOBS.find((x) => x.id === job)
  return j ? j.aurora : JOBS[0].aurora
}

export type Stage = 'start' | 'select' | 'equipped'

interface Framing {
  pos: THREE.Vector3
  look: THREE.Vector3
}

const FRAMINGS: Record<Stage, Framing> = {
  // start: low near the threshold, dark shard cluster filling the left of
  // frame (TLOU's dark wall), aurora glowing center-right
  start: { pos: new THREE.Vector3(4.5, 2.0, 25), look: new THREE.Vector3(-3, 7.5, -22) },
  // select: pulled back and centered; the portrait DOM sits center-stage
  select: { pos: new THREE.Vector3(0, 3.6, 22), look: new THREE.Vector3(0, 4.4, -18) },
  // equipped: slightly elevated; panels scroll over the world
  equipped: { pos: new THREE.Vector3(0, 5.0, 19), look: new THREE.Vector3(0, 4.0, -20) },
}

function CameraRig({ stage, reduced }: { stage: Stage; reduced: boolean }) {
  const base = useRef(FRAMINGS.start.pos.clone())
  const look = useRef(FRAMINGS.start.look.clone())
  const t = useRef(0)
  useFrame(({ camera }, delta) => {
    const f = FRAMINGS[stage]
    if (reduced) {
      base.current.copy(f.pos)
      look.current.copy(f.look)
    } else {
      const k = 1 - Math.exp(-delta * 2.0)
      base.current.lerp(f.pos, k)
      look.current.lerp(f.look, k)
      t.current += delta
    }
    const dx = reduced ? 0 : Math.sin(t.current * 0.1) * 0.45
    const dy = reduced ? 0 : Math.sin(t.current * 0.073) * 0.22
    camera.position.set(base.current.x + dx, base.current.y + dy, base.current.z)
    camera.lookAt(look.current)
  })
  return null
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
  const frozenDeep = job === null || job === 'physicist'
  const bloom = useMemo(() => bloomOk(), [])
  const aurora = auroraFor(tintJob)
  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, maxDpr()]}
        camera={{ fov: 50, near: 0.1, far: 160, position: [0, 1.8, 27] }}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ alpha: true }}
      >
        {frozenDeep && <FrozenDeep frozen={reduced} up={aurora.up} down={aurora.down} />}
        <CameraRig stage={stage} reduced={reduced} />
        {bloom && frozenDeep && (
          <EffectComposer multisampling={composerSamples()}>
            <Bloom luminanceThreshold={0.55} intensity={0.7} mipmapBlur />
            <Vignette eskil={false} offset={0.18} darkness={0.78} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
