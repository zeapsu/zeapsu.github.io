// Live GPE sim -> GPU history feed for the frozen-deep aurora.
// The parked sim-variation plan lives here: every visit gets its own seed
// (?seed=N reproduces a visit exactly), and every quench cycle re-derives its
// parameters as a pure function of (visitSeed, cycle) via mulberry32, inside
// ranges whose weak corner (g12=1.6, damping=0.05) the gpe selfcheck pins.
import * as THREE from 'three'
import { createSim, mulberry32, type GPESim } from '../sim/gpe'

export const SIM_N = 256
export const HISTORY_ROWS = 128

const STEPS_PER_FRAME = 6
const ROW_EVERY = 3 // frames between history rows
const UNQUENCH_AT = 26 // cycle timeline (seconds)
const CYCLE = 34
// prefill puts the visit ~10s of sim time into the cycle: domains formed,
// a stretch of settled evolution before the first unquench
const PREFILL_T0 = 10

export interface SimFeed {
  readonly texture: THREE.DataTexture
  readonly visitSeed: number
  /** newest history row (ring buffer pointer for the shaders) */
  head(): number
  /** advance the sim by one rendered frame */
  tick(delta: number): void
}

export function cycleParams(visitSeed: number, cycle: number) {
  const r = mulberry32((visitSeed ^ Math.imul(cycle + 1, 0x9e3779b9)) >>> 0)
  return {
    seed: (r() * 0x100000000) >>> 0,
    g12Immiscible: 1.6 + r() * 0.4,
    damping: 0.03 + r() * 0.02,
  }
}

function makeSim(visitSeed: number, cycle: number): GPESim {
  const p = cycleParams(visitSeed, cycle)
  const sim = createSim({
    n: SIM_N,
    damping: p.damping,
    g12Immiscible: p.g12Immiscible,
    seed: p.seed,
  })
  sim.quench()
  return sim
}

export function resolveVisitSeed(search: string): number {
  try {
    const v = new URLSearchParams(search).get('seed')
    if (v !== null && /^\d+$/.test(v)) return Number(v) >>> 0
  } catch {
    /* malformed URL: fall through to a random visit */
  }
  return (Math.random() * 0x100000000) >>> 0
}

export function createSimFeed(frozen: boolean, visitSeed: number): SimFeed {
  let cycle = 0
  let sim = makeSim(visitSeed, cycle)
  const history = new Float32Array(HISTORY_ROWS * SIM_N)
  const texture = new THREE.DataTexture(history, SIM_N, HISTORY_ROWS, THREE.RedFormat, THREE.FloatType)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter

  // Prefill: evolve past domain formation, then walk forward one row at a
  // time so the history axis holds real consecutive field states from first
  // paint (the aurora's vertical axis is history age).
  sim.step(1200)
  let head = HISTORY_ROWS - 1
  for (let j = 0; j < HISTORY_ROWS; j++) {
    sim.step(STEPS_PER_FRAME * ROW_EVERY)
    history.set(sim.spin, j * SIM_N)
  }
  texture.needsUpdate = true

  let cycleT = PREFILL_T0
  let frame = 0
  let quenched = true

  function tick(delta: number) {
    if (frozen) return
    cycleT += delta
    if (quenched && cycleT >= UNQUENCH_AT) {
      sim.unquench()
      quenched = false
    }
    if (cycleT >= CYCLE) {
      // recreate per cycle: fresh params from (visitSeed, cycle), re-quench
      // from noise so domain formation itself is part of the show
      cycle += 1
      sim = makeSim(visitSeed, cycle)
      cycleT = 0
      quenched = true
    }
    sim.step(STEPS_PER_FRAME)
    frame += 1
    if (frame % ROW_EVERY === 0) {
      head = (head + 1) % HISTORY_ROWS
      history.set(sim.spin, head * SIM_N)
      texture.needsUpdate = true
    }
  }

  return { texture, visitSeed, head: () => head, tick }
}
