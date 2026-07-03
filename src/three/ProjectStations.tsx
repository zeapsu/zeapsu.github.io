// Five floating project stations staged along the projects stretch of the
// camera path (issue #2). Each is scroll-window gated: outside its window it
// is invisible and costs nothing, and the hero/closing cameras (which stare
// straight down this corridor un-fogged) never see the whole row at once.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { mobileLayout, CARD_BASE, CARD_STEP, PAGES } from '../layout'

// Card i tops the viewport at (CARD_BASE + i*CARD_STEP)/((PAGES-1)*100) (see
// JourneyCamera.tsx); it is visually centered ~25dvh of scroll earlier.
const FOCUS = [0, 1, 2, 3, 4].map(
  (i) => (CARD_BASE + i * CARD_STEP - 25) / ((PAGES - 1) * 100),
)
// Half-width of each station's scroll window, ~the range its card is on screen.
const HALF = mobileLayout ? 0.11 : 0.15

// Portrait half-hfov at fov 55 is ~13.5deg vs ~43deg landscape; pull stations
// toward center on mobile or they leave the frustum.
const X = mobileLayout ? 1.5 : 4

// Station i floats opposite its DOM card (cards alternate left/right in
// Sections.tsx, card 0 left), above the terrain crest (y = -1.2 + 1.6 = 0.4),
// marching away in z with the camera's projects glide. Mobile cards are
// full-width glass, so ride ~2.6 higher there to sit in the empty band above
// the card instead of behind it.
const Y = mobileLayout ? 4.8 : 2.2
const POS = [0, 0.4, -0.2, 0.3, 0.1].map(
  (dy, i) => [(i % 2 ? -1 : 1) * X, Y + dy, -3 - 2.5 * i] as const,
)

// Shared geometry: ~80-tri wireframe shell, tiny core, thin ring. All unlit
// MeshBasicMaterial -- the scene has no lights, the terrain is self-shaded.
const SHELL_GEO = new THREE.IcosahedronGeometry(0.9, 1)
const CORE_GEO = new THREE.IcosahedronGeometry(0.16, 0)
const RING_GEO = new THREE.TorusGeometry(1.2, 0.012, 5, 40)

const TEAL = new THREE.Color('#4fd8c8')
const AMBER = new THREE.Color('#f0a848')

const smoothstep = (x: number, a: number, b: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

export function ProjectStations({ frozen = false }: { frozen?: boolean }) {
  const scroll = useScroll()
  const groups = useRef<(THREE.Group | null)[]>([])

  // Dimmed x0.55 the wires and idle cores sit under the Bloom luminance
  // threshold (0.72; full teal is ~0.73). Only the focused station's core is
  // lifted past it, so at most one halo at a time on desktop.
  const stations = useMemo(
    () =>
      POS.map((_, i) => {
        const base = i % 2 ? AMBER : TEAL
        const dim = base.clone().multiplyScalar(0.55)
        return {
          base,
          wire: new THREE.MeshBasicMaterial({ color: dim, wireframe: true }),
          ring: new THREE.MeshBasicMaterial({ color: dim }),
          core: new THREE.MeshBasicMaterial({ color: dim.clone() }),
        }
      }),
    [],
  )

  useFrame(({ clock }) => {
    const o = THREE.MathUtils.clamp(scroll.offset, 0, 1)
    const t = clock.elapsedTime
    groups.current.forEach((g, i) => {
      if (!g) return
      // Scroll-driven, so it runs even when frozen -- same rule as the camera
      // following scroll under reduced motion.
      const s = 1 - smoothstep(Math.abs(o - FOCUS[i]), HALF * 0.5, HALF)
      g.visible = s > 0.01
      if (!g.visible) return
      g.scale.setScalar(s)
      stations[i].core.color.copy(stations[i].base).multiplyScalar(0.55 + 0.85 * s * s)
      if (!frozen) {
        g.rotation.y = t * 0.15 * (i % 2 ? -1 : 1) + i * 1.3
        g.position.y = POS[i][1] + Math.sin(t * 0.6 + i * 1.7) * 0.12
      }
    })
  })

  return (
    <>
      {stations.map((st, i) => (
        <group
          key={i}
          ref={(el) => (groups.current[i] = el)}
          position={[...POS[i]]}
          rotation={[0.3, i * 1.3, 0.15]}
          visible={false}
        >
          <mesh geometry={SHELL_GEO} material={st.wire} />
          <mesh geometry={CORE_GEO} material={st.core} />
          <mesh geometry={RING_GEO} material={st.ring} rotation={[Math.PI / 2 - 0.35, 0, i * 0.4]} />
        </group>
      ))}
    </>
  )
}
