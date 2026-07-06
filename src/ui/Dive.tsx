import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '../sim/gpe'

// The SAO "Link Start" dive: a rainbow light-stream tunnel that accelerates
// toward and past the viewer, resolving into the character-select spawn. It is
// a deliberately theatrical entry beat; the recruiter-restraint mitigations
// (black first frame, literal job names, one-click plain hatch) live elsewhere.
// This is a dedicated transient R3F root, mounted only during the `dive` phase
// and fully unmounted after, so it never costs anything once the gate is up.
// Not played under reduced-motion or no-WebGL (App bypasses straight to select).

const DURATION = 2.8 // seconds to auto-resolve; any input skips sooner
const STREAKS = 700
const DEPTH = 60 // how far back the tunnel extends, in world units

// Streaks live as line segments in a cylindrical shell around the view axis.
// Camera sits at the origin looking down -Z; each streak rushes from far -Z
// toward and past the eye (z crossing 0), then recycles to the far end. Speed
// ramps over the dive, and streak length grows with speed, so the field reads
// slow-drift -> warp. Rainbow hue is fixed per streak by its angle, and the
// whole field rolls slowly, so the spectrum sweeps like the SAO tunnel.
function Tunnel() {
  const group = useRef<THREE.LineSegments>(null)
  const t = useRef(0)
  const state = useMemo(() => {
    const rand = mulberry32(4242)
    const positions = new Float32Array(STREAKS * 2 * 3)
    const colors = new Float32Array(STREAKS * 2 * 3)
    const z = new Float32Array(STREAKS)
    const ang = new Float32Array(STREAKS)
    const rad = new Float32Array(STREAKS)
    const spd = new Float32Array(STREAKS)
    const col = new THREE.Color()
    for (let i = 0; i < STREAKS; i++) {
      ang[i] = rand() * Math.PI * 2
      rad[i] = 0.6 + rand() * rand() * 8 // bias toward the core, a few wide streaks
      z[i] = -rand() * DEPTH
      spd[i] = 0.7 + rand() * 0.6
      // saturated + mid lightness so the hue survives additive blending; the
      // dense core still stacks to a hot white light at the tunnel's end
      col.setHSL(ang[i] / (Math.PI * 2), 1.0, 0.5)
      const o = i * 6
      colors[o] = colors[o + 3] = col.r
      colors[o + 1] = colors[o + 4] = col.g
      colors[o + 2] = colors[o + 5] = col.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { positions, z, ang, rad, spd, geo, mat }
  }, [])

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05)
    t.current += d
    const p = Math.min(t.current / DURATION, 1)
    const accel = 8 + 90 * p * p // ease-in: the tunnel visibly speeds up
    const { positions, z, ang, rad, spd } = state
    for (let i = 0; i < STREAKS; i++) {
      z[i] += spd[i] * accel * d
      if (z[i] > 1) z[i] -= DEPTH + 1 // recycle behind the eye back to the far end
      const zi = z[i]
      const len = 1.2 + spd[i] * accel * 0.05 // streak stretches with speed
      const x = Math.cos(ang[i]) * rad[i]
      const y = Math.sin(ang[i]) * rad[i]
      const o = i * 6
      positions[o] = x
      positions[o + 1] = y
      positions[o + 2] = zi
      positions[o + 3] = x
      positions[o + 4] = y
      positions[o + 5] = zi - len
    }
    state.geo.attributes.position.needsUpdate = true
    if (group.current) group.current.rotation.z += d * 0.25 // slow spectral roll
  })

  return (
    <lineSegments ref={group} geometry={state.geo} material={state.mat} frustumCulled={false} />
  )
}

export function Dive({ onComplete }: { onComplete: () => void }) {
  // fire once, whether by timeout or a skip input
  const done = useRef(false)
  useEffect(() => {
    const finish = () => {
      if (done.current) return
      done.current = true
      onComplete()
    }
    const timer = setTimeout(finish, DURATION * 1000)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.altKey || e.ctrlKey || e.metaKey) return
      // stop Enter's default from leaking into the job card that autofocuses
      // on the select screen and instantly equipping it (same guard as start)
      e.preventDefault()
      finish()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [onComplete])

  return (
    <div className="dive" onClick={() => onComplete()} onTouchStart={() => onComplete()}>
      <Canvas
        camera={{ fov: 80, near: 0.05, far: 120, position: [0, 0, 0] }}
        gl={{ alpha: false, toneMapping: THREE.NoToneMapping }}
        frameloop="always"
      >
        <color attach="background" args={['#01010a']} />
        <Tunnel />
      </Canvas>
      <p className="dive-title" aria-hidden="true">
        link start
      </p>
      <div className="dive-flash" aria-hidden="true" />
    </div>
  )
}
