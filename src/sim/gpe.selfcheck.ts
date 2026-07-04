// Self-check for the GPE solver. Run: node src/sim/gpe.selfcheck.ts
import { createSim } from './gpe.ts'
import assert from 'node:assert'

// 1. Norm conservation (undamped split-step should conserve to FFT roundoff)
{
  const sim = createSim({ n: 256, damping: 0 })
  const norm0 = sim.norm()
  sim.step(400)
  const err = Math.abs(sim.norm() - norm0) / norm0
  assert.ok(err < 1e-6, `norm drift ${err} >= 1e-6`)
}

// 2. Quench forms domain walls (damped, immiscible: spin density must change sign)
{
  const sim = createSim({ n: 256, damping: 0.03, seed: 42 })
  sim.quench()
  sim.step(3000)
  let walls = 0
  const s = sim.spin
  for (let i = 0; i < s.length; i++) {
    if (Math.sign(s[i]) !== Math.sign(s[(i + 1) % s.length]) && Math.abs(s[i]) > 0.1) walls++
  }
  assert.ok(walls >= 2, `only ${walls} domain walls after quench`)
  // walls imply real phase separation: spin must saturate somewhere
  const maxAbs = Math.max(...Array.from(s, Math.abs))
  assert.ok(maxAbs > 0.5, `spin never saturates (max |s| = ${maxAbs.toFixed(3)})`)
}

// 3. Weak corner of the per-visit variation ranges (frozen-deep aurora draws
//    cycle params from g12 in [1.6, 2.0] and damping in [0.03, 0.05]; the
//    least-immiscible, most-damped corner must still phase-separate)
{
  const sim = createSim({ n: 256, damping: 0.05, g12Immiscible: 1.6, seed: 1234 })
  sim.quench()
  sim.step(3000)
  let walls = 0
  const s = sim.spin
  for (let i = 0; i < s.length; i++) {
    if (Math.sign(s[i]) !== Math.sign(s[(i + 1) % s.length]) && Math.abs(s[i]) > 0.1) walls++
  }
  assert.ok(walls >= 2, `weak corner: only ${walls} domain walls after quench`)
  const maxAbs = Math.max(...Array.from(s, Math.abs))
  assert.ok(maxAbs > 0.5, `weak corner: spin never saturates (max |s| = ${maxAbs.toFixed(3)})`)
}

// 4. Determinism with a fixed seed (rendering loop relies on stable restarts)
{
  const a = createSim({ n: 128, seed: 7 })
  const b = createSim({ n: 128, seed: 7 })
  a.quench(); b.quench()
  a.step(200); b.step(200)
  assert.deepStrictEqual(Array.from(a.spin), Array.from(b.spin))
}

console.log('gpe self-check: all assertions passed')
