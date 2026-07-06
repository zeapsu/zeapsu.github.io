import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '../sim/gpe'

// The SAO "Link Start" dive plays in three beats over ~7s: a realistic dev
// terminal boots a venv and runs a link script whose output is the neural-link
// sequence; its final line, "link start", blooms into the centered title and
// lingers; then a rainbow light-stream tunnel emanates from a contained point
// in the distance and accelerates past the viewer, resolving into the spawn. A
// deliberately theatrical entry beat; the recruiter-restraint mitigations
// (black first frame, literal job names, one-click plain hatch) live elsewhere.
// The tunnel is a dedicated transient R3F root, mounted only for the warp beat
// and unmounted after, so it never costs anything once the gate is up. Not
// played under reduced-motion or no-WebGL (App bypasses straight to select).

const BOOT_MS = 3200 // terminal boots + runs the link script
const TITLE_MS = 1000 // "LINK START" lingers, centered, before the stream
const WARP_MS = 3000 // tunnel emanates from the distance and accelerates past
const WARP_S = WARP_MS / 1000
const TITLE_IN_S = 2.9 // when the "link start" line lands as terminal output

const STREAKS = 700
const DEPTH = 60 // how far back the tunnel extends, in world units

// A real terminal beat: activate a venv, run the link script, then the script's
// output streams. `at` is the reveal time in seconds; the gap after the run
// command reads as execution. The closing "link start" is the title element,
// not a log row, so it is not listed here.
const BOOT_LINES: { text: string; at: number }[] = [
  { text: '$ source .venv/bin/activate', at: 0.15 },
  { text: '(.venv) $ python link_start.py', at: 0.6 },
  { text: 'establishing neural link ...', at: 1.45 },
  { text: 'calibrating senses ......... ok', at: 1.8 },
  { text: 'mounting world shards ...... ok', at: 2.1 },
  { text: 'loading character registry . ok', at: 2.4 },
  { text: 'handshake complete', at: 2.7 },
]

// Streaks live as line segments in a cylindrical shell around the view axis.
// Camera sits at the origin looking down -Z. They start bunched in the far end
// and are squeezed toward the axis (rScale) so the stream opens as a contained
// point at screen centre, then spreads as it nears. Each rushes past the eye (z
// crossing 0); on recycle it respawns spread across the far half rather than at
// a single point, so the field never re-bunches into a second emanation (which
// read as the animation restarting at the end). Speed ramps over the warp,
// length grows with speed. Rainbow hue is fixed per streak by its angle and the
// field rolls slowly, sweeping the spectrum like the SAO tunnel.
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
      rad[i] = 0.4 + rand() * rand() * 6.5 // bias toward the core, a few wide streaks
      z[i] = -DEPTH * (0.8 + 0.2 * rand()) // start bunched in the far 20%
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
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { positions, z, ang, rad, spd, geo, mat }
  }, [])

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05)
    t.current += d
    const p = Math.min(t.current / WARP_S, 1)
    const accel = 5 + 130 * p * p // ease-in: emanate slowly, then warp
    // start as a tight point at centre and hold contained, then spread: an
    // ease-in radial scale keeps the stream narrow for the first ~1s
    const q = Math.min(t.current / 1.7, 1)
    const rScale = 0.08 + 0.92 * q * q
    const { positions, z, ang, rad, spd } = state
    for (let i = 0; i < STREAKS; i++) {
      z[i] += spd[i] * accel * d
      // respawn spread across the far half, not at one point, so the field
      // stays continuous and never re-emanates as if restarting
      if (z[i] > 1) z[i] = -DEPTH + Math.random() * DEPTH * 0.5
      const zi = z[i]
      const len = 1.2 + spd[i] * accel * 0.05 // streak stretches with speed
      const x = Math.cos(ang[i]) * rad[i] * rScale
      const y = Math.sin(ang[i]) * rad[i] * rScale
      const o = i * 6
      positions[o] = x
      positions[o + 1] = y
      positions[o + 2] = zi
      positions[o + 3] = x
      positions[o + 4] = y
      positions[o + 5] = zi - len
    }
    state.geo.attributes.position.needsUpdate = true
    state.mat.opacity = Math.min(t.current / 0.3, 1) // fade the field in from the point
    if (group.current) group.current.rotation.z += d * 0.2 // slow spectral roll
  })

  return (
    <lineSegments ref={group} geometry={state.geo} material={state.mat} frustumCulled={false} />
  )
}

// onComplete's `whiteOut` is true only when the dive ran to its natural end,
// where the tunnel has blown out to full white and the gate should dissolve out
// of that white. A skip (click/key) at any earlier beat passes false, so the
// gate cuts in cleanly instead of flashing dark -> white.
export function Dive({ onComplete }: { onComplete: (whiteOut: boolean) => void }) {
  const [stage, setStage] = useState<'boot' | 'title' | 'warp'>('boot')
  const done = useRef(false)
  const finish = useCallback(
    (whiteOut: boolean) => {
      if (done.current) return
      done.current = true
      onComplete(whiteOut)
    },
    [onComplete]
  )
  useEffect(() => {
    const toTitle = setTimeout(() => setStage('title'), BOOT_MS)
    const toWarp = setTimeout(() => setStage('warp'), BOOT_MS + TITLE_MS)
    const end = setTimeout(() => finish(true), BOOT_MS + TITLE_MS + WARP_MS)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.altKey || e.ctrlKey || e.metaKey) return
      // a bare modifier press is not a skip (matches StartScreen)
      if (e.key === 'Shift' || e.key === 'Alt' || e.key === 'Control' || e.key === 'Meta') return
      // only swallow the keys that would otherwise leak their default into the
      // job card that autofocuses on the select screen (Enter/Space activate
      // it); other keys still skip but keep their browser default (e.g. F5)
      if (e.key === 'Enter' || e.key === ' ') e.preventDefault()
      finish(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(toTitle)
      clearTimeout(toWarp)
      clearTimeout(end)
      window.removeEventListener('keydown', onKey)
    }
  }, [finish])

  return (
    // click-to-skip only (no onTouchStart): a tap already produces a click, and
    // routing the skip through click keeps the event targeted at the dive so it
    // cannot ghost-click into the select screen that mounts under the finger
    <div className={`dive ${stage}`} onClick={() => finish(false)}>
      {stage === 'warp' && (
        <Canvas
          camera={{ fov: 80, near: 0.05, far: 120, position: [0, 0, 0] }}
          gl={{ alpha: false, toneMapping: THREE.NoToneMapping }}
          frameloop="always"
        >
          <color attach="background" args={['#01010a']} />
          <Tunnel />
        </Canvas>
      )}
      <div className="dive-boot" aria-hidden="true">
        {BOOT_LINES.map((line, i) => (
          <span
            key={i}
            className="dive-boot-line"
            style={{ animationDelay: `${line.at}s` } as CSSProperties}
          >
            {line.text}
          </span>
        ))}
      </div>
      {/* the link script's closing line: a green terminal row during boot that
          blooms into the centered hero title and lingers before the stream */}
      <p className="dive-title" style={{ animationDelay: `${TITLE_IN_S}s` }} aria-hidden="true">
        link start
      </p>
      <div className="dive-flash" aria-hidden="true" />
    </div>
  )
}
