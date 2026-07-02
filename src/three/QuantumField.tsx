// Spacetime terrain: the live GPE sim rendered as a waterfall surface.
// x = space, z = time history flowing away from the camera, y/color = spin density.
// Domain walls (spin = 0) read as dark fault lines between glowing domains.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createSim } from '../sim/gpe'

const N = 256 // sim grid = terrain columns
const M = 128 // history rows
const WIDTH = 30
const DEPTH = 46
const HEIGHT = 1.6

const SPIN_UP = new THREE.Color('#7dd6ff')
const SPIN_DOWN = new THREE.Color('#ff94d2')

const STEPS_PER_FRAME = 6
const ROW_EVERY = 3 // frames between history rows
const QUENCH_AT = 0 // cycle timeline (seconds)
const UNQUENCH_AT = 26
const CYCLE = 34

export function QuantumField({ frozen = false }: { frozen?: boolean }) {
  const mesh = useRef<THREE.Mesh>(null!)
  const state = useMemo(() => {
    const sim = createSim({ n: N, damping: 0.03, seed: 1 })
    sim.quench()
    const history = new Float32Array(M * N) // ring buffer of spin rows
    const st = { sim, history, head: 0, frame: 0, cycleT: 0, cycle: 0, quenched: true }
    if (frozen) {
      // reduced motion: show fully formed domains, then never step again
      sim.step(3000)
      for (let j = 0; j < M; j++) history.set(sim.spin, j * N)
    }
    return st
  }, [frozen])

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WIDTH, DEPTH, N - 1, M - 1)
    geo.rotateX(-Math.PI / 2)
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * M * 3), 3))
    return geo
  }, [])

  const paint = () => {
    const pos = geometry.attributes.position as THREE.BufferAttribute
    const col = geometry.attributes.color as THREE.BufferAttribute
    const { history, head } = state
    // vertex row j: after rotateX, j=0 sits at z=-DEPTH/2 (far). Newest history
    // row goes to the near edge (j=M-1), oldest to the far edge.
    for (let j = 0; j < M; j++) {
      const age = M - 1 - j // 0 = newest
      const row = (((head - age) % M) + M) % M
      const fade = 1 - (age / M) * 0.55 // older rows dim before fog takes over
      for (let i = 0; i < N; i++) {
        const s = history[row * N + i]
        const v = j * N + i
        pos.setY(v, s * HEIGHT)
        const t = Math.min(1, Math.abs(s))
        const glow = (0.06 + 0.94 * Math.pow(t, 0.8)) * fade
        const c = s >= 0 ? SPIN_UP : SPIN_DOWN
        col.setXYZ(v, c.r * glow, c.g * glow, c.b * glow)
      }
    }
    pos.needsUpdate = true
    col.needsUpdate = true
    geometry.computeBoundingSphere()
  }

  useMemo(paint, [geometry, state]) // first frame, and the only paint when frozen

  useFrame((_, delta) => {
    if (frozen) return
    const st = state
    st.cycleT += delta
    if (st.quenched && st.cycleT >= UNQUENCH_AT) {
      st.sim.unquench()
      st.quenched = false
    }
    if (st.cycleT >= CYCLE) {
      st.cycle += 1
      st.cycleT = QUENCH_AT
      st.sim.quench(1 + st.cycle * 7919)
      st.quenched = true
    }
    st.sim.step(STEPS_PER_FRAME)
    st.frame += 1
    if (st.frame % ROW_EVERY === 0) {
      st.head = (st.head + 1) % M
      st.history.set(st.sim.spin, st.head * N)
    }
    paint()
  })

  return (
    <mesh ref={mesh} geometry={geometry} position={[0, -1.2, -8]}>
      <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  )
}
