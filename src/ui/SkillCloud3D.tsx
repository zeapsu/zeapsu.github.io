import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import { Color, type Group, type Mesh } from 'three'
import { JOBS, type JobId } from '../content/jobs'
import { skillTree } from '../content/data'
import monoFont from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff?url'

// The volumetric skill cloud (lazy chunk — three loads only if this mounts).
// Tokens sit on a fibonacci sphere that drifts slowly; the active facet's
// motes catch their wavelength while the rest grey out. Decorative twin of
// the sr-only DOM list rendered by SkillField.

// dimmed-mote grey per sheet theme: readable-but-quiet on either ground
const GREY = '#453f55'
const GREY_LIGHT = '#8f8a80'
// on paper, lit accents mix toward ink (the CSS accent-ink move, in three)
const INK = '#241d33'

interface Mote {
  token: string
  job: JobId
  accent: string
  pos: [number, number, number]
  size: number
}

function motes(): Mote[] {
  const all = skillTree.flatMap((b) =>
    b.skills.map((token) => ({
      token,
      job: b.job,
      accent: JOBS.find((j) => j.id === b.job)!.palette.accent,
    })),
  )
  const n = all.length
  const golden = Math.PI * (3 - Math.sqrt(5))
  return all.map((m, i) => {
    // fibonacci sphere: even distribution, no runtime randomness
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = golden * i
    const R = 2.55
    return {
      ...m,
      pos: [Math.cos(th) * r * R, y * R * 0.82, Math.sin(th) * r * R] as [number, number, number],
      size: 0.13 + ((i * 7) % 3) * 0.035,
    }
  })
}

function Cloud({ lens, light }: { lens: JobId | null; light: boolean }) {
  const group = useRef<Group>(null)
  const items = useMemo(motes, [])
  const texts = useRef<(Mesh | null)[]>([])
  // Per-frame targets live in a ref so useFrame never sees stale props.
  const lensRef = useRef(lens)
  lensRef.current = lens
  const lightRef = useRef(light)
  lightRef.current = light
  const pointer = useRef({ x: 0, y: 0 })
  const scratch = useMemo(() => new Color(), [])
  const ink = useMemo(() => new Color(INK), [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const step = Math.min(1, dt * 4)
    // slow drift + gentle pointer tilt; fit the sphere to narrow viewports
    g.rotation.y += dt * 0.07
    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.03
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.03
    g.rotation.x = pointer.current.y * -0.18
    g.rotation.z = pointer.current.x * 0.06
    const fit = Math.min(1, state.viewport.width / 6.2)
    g.scale.setScalar(fit)

    const active = lensRef.current
    items.forEach((m, i) => {
      const t = texts.current[i]
      // troika's live color is on the derived material (the .color prop is
      // just a string); mutating it directly avoids a re-sync per frame.
      const mat = t?.material as { color?: Color } | undefined
      if (!mat?.color) return
      const lit = active === null || active === m.job
      if (lit) {
        scratch.set(m.accent)
        if (lightRef.current) scratch.lerp(ink, 0.45)
      } else {
        scratch.set(lightRef.current ? GREY_LIGHT : GREY)
      }
      mat.color.lerp(scratch, step)
    })
  })

  return (
    <group ref={group}>
      {items.map((m, i) => (
        <Billboard key={m.token} position={m.pos}>
          <Text
            ref={(el) => {
              texts.current[i] = el as Mesh | null
            }}
            font={monoFont}
            fontSize={m.size}
            color={m.accent}
            anchorX="center"
            anchorY="middle"
          >
            {m.token}
          </Text>
        </Billboard>
      ))}
    </group>
  )
}

export default function SkillCloud3D({
  lens,
  active,
  light = false,
}: {
  lens: JobId | null
  active: boolean
  light?: boolean
}) {
  // A lost GL context never recovers in place (StrictMode's dev double-mount
  // force-loses it; real GPU eviction can too) — remount a fresh canvas node.
  const [epoch, setEpoch] = useState(0)
  return (
    <Canvas
      key={epoch}
      aria-hidden="true"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6.4], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      frameloop={active ? 'always' : 'never'}
      style={{ pointerEvents: 'none' }}
      eventSource={document.body}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          'webglcontextlost',
          (e) => {
            e.preventDefault()
            setTimeout(() => setEpoch((n) => n + 1), 0)
          },
          { once: true },
        )
      }}
    >
      <Cloud lens={lens} light={light} />
    </Canvas>
  )
}
