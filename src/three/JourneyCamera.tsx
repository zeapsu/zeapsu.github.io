// Scroll-driven camera path through the journey, with gentle mouse parallax.
// Also publishes scroll progress as a CSS var for the DOM progress rail.
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'

interface Key {
  at: number
  pos: [number, number, number]
  look: [number, number, number]
}

// Tuned against the field at y=-1.2, z=-8: hero looks along the terrain,
// research skims it, projects float above it, contact faces the horizon.
const KEYS: Key[] = [
  { at: 0.0, pos: [0, 2.6, 10.5], look: [0, -0.2, -10] },
  { at: 0.18, pos: [-6, 0.4, 4.5], look: [4, -0.8, -9] },
  { at: 0.4, pos: [0, 7, 7], look: [0, -2.5, -12] },
  { at: 0.78, pos: [0, 8, 0], look: [0, -2.5, -18] },
  { at: 1.0, pos: [0, 2.6, 14], look: [0, 1.8, -30] },
]

const smooth = (t: number) => t * t * (3 - 2 * t)

export function JourneyCamera({ frozen = false }: { frozen?: boolean }) {
  const scroll = useScroll()
  const { camera, pointer } = useThree()
  const cur = useRef({ pos: new THREE.Vector3(...KEYS[0].pos), look: new THREE.Vector3(...KEYS[0].look) })
  const target = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3() })

  useFrame((_, delta) => {
    const o = THREE.MathUtils.clamp(scroll.offset, 0, 1)
    document.documentElement.style.setProperty('--scroll', o.toFixed(4))

    let a = KEYS[0]
    let b = KEYS[KEYS.length - 1]
    for (let k = 0; k < KEYS.length - 1; k++) {
      if (o >= KEYS[k].at && o <= KEYS[k + 1].at) {
        a = KEYS[k]
        b = KEYS[k + 1]
        break
      }
    }
    const t = smooth(b.at === a.at ? 0 : (o - a.at) / (b.at - a.at))
    target.current.pos.set(...a.pos).lerp(new THREE.Vector3(...b.pos), t)
    target.current.look.set(...a.look).lerp(new THREE.Vector3(...b.look), t)

    if (!frozen) {
      target.current.pos.x += pointer.x * 0.7
      target.current.pos.y += pointer.y * 0.35
    }
    // ponytail: exp damping, no gsap; add it only if easing needs choreography
    const k = frozen ? 1 : 1 - Math.exp(-6 * delta)
    cur.current.pos.lerp(target.current.pos, k)
    cur.current.look.lerp(target.current.look, k)
    camera.position.copy(cur.current.pos)
    camera.lookAt(cur.current.look)
  })

  return null
}
