// 1D two-component (spin-1/2) Gross-Pitaevskii solver, split-step Fourier.
// The same equations behind my SJSU BEC research, small enough to run in a browser:
//   i dψ_j/dt = [-(1/2) d²/dx² + g n_j + g12 n_k] ψ_j   (periodic ring, ħ=m=1)
// Immiscibility (g12 > g) after a quench grows spin domains separated by walls.
// Optional damping γ evolves with dt(1-iγ) and renormalizes, so domains settle
// instead of ringing forever. ponytail: Float64 CPU solver at N=256; a GPU
// version only if profiling ever says so.

export interface SimOptions {
  n?: number
  length?: number
  dt?: number
  g?: number
  g12Miscible?: number
  g12Immiscible?: number
  damping?: number
  seed?: number
}

export interface GPESim {
  readonly n: number
  /** spin density (n1-n2)/(n1+n2) in [-1,1], updated by step() */
  readonly spin: Float32Array
  /** total density n1+n2, updated by step() */
  readonly density: Float32Array
  norm(): number
  /** advance `steps` split-steps */
  step(steps: number): void
  /** reset to uniform mixture + noise, set immiscible coupling */
  quench(seed?: number): void
  /** dissolve domains: back to miscible coupling without reseeding */
  unquench(): void
}

// mulberry32: tiny seedable PRNG, enough for noise seeding
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// In-place radix-2 complex FFT (Cooley-Tukey), n must be a power of 2.
function fft(re: Float64Array, im: Float64Array, invert: boolean) {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[re[i], re[j]] = [re[j], re[i]]
      ;[im[i], im[j]] = [im[j], im[i]]
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((invert ? 1 : -1) * 2 * Math.PI) / len
    const wr = Math.cos(ang)
    const wi = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let cwr = 1
      let cwi = 0
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k]
        const ui = im[i + k]
        const vr = re[i + k + len / 2] * cwr - im[i + k + len / 2] * cwi
        const vi = re[i + k + len / 2] * cwi + im[i + k + len / 2] * cwr
        re[i + k] = ur + vr
        im[i + k] = ui + vi
        re[i + k + len / 2] = ur - vr
        im[i + k + len / 2] = ui - vi
        const nwr = cwr * wr - cwi * wi
        cwi = cwr * wi + cwi * wr
        cwr = nwr
      }
    }
  }
  if (invert) {
    for (let i = 0; i < n; i++) {
      re[i] /= n
      im[i] /= n
    }
  }
}

export function createSim(opts: SimOptions = {}): GPESim {
  const n = opts.n ?? 256
  const L = opts.length ?? 80
  const dt = opts.dt ?? 0.04
  const g = opts.g ?? 1
  const g12Mi = opts.g12Miscible ?? 0.6
  const g12Im = opts.g12Immiscible ?? 1.8
  const gamma = opts.damping ?? 0
  const seed = opts.seed ?? 1

  // ψ1, ψ2 as separate re/im arrays
  const r1 = new Float64Array(n)
  const i1 = new Float64Array(n)
  const r2 = new Float64Array(n)
  const i2 = new Float64Array(n)
  const spin = new Float32Array(n)
  const density = new Float32Array(n)

  // kinetic half-step phase factors exp(-i dt k²/2), with decay when damped
  const kinR = new Float64Array(n)
  const kinI = new Float64Array(n)
  {
    const dk = (2 * Math.PI) / L
    for (let m = 0; m < n; m++) {
      const k = dk * (m < n / 2 ? m : m - n)
      const phase = -0.5 * k * k * dt
      const decay = Math.exp(gamma * phase)
      kinR[m] = decay * Math.cos(phase)
      kinI[m] = decay * Math.sin(phase)
    }
  }

  let g12 = g12Mi
  let norm0 = 0

  function computeObservables() {
    for (let j = 0; j < n; j++) {
      const d1 = r1[j] * r1[j] + i1[j] * i1[j]
      const d2 = r2[j] * r2[j] + i2[j] * i2[j]
      const d = d1 + d2
      density[j] = d
      spin[j] = d > 1e-12 ? (d1 - d2) / d : 0
    }
  }

  function currentNorm() {
    let s = 0
    for (let j = 0; j < n; j++) {
      s += r1[j] * r1[j] + i1[j] * i1[j] + r2[j] * r2[j] + i2[j] * i2[j]
    }
    return (s * L) / n
  }

  function seedState(rand: () => number) {
    const amp = Math.SQRT1_2 // uniform 50/50 mixture at density 1
    const eps = 0.02
    for (let j = 0; j < n; j++) {
      r1[j] = amp + eps * (rand() - 0.5)
      i1[j] = eps * (rand() - 0.5)
      r2[j] = amp + eps * (rand() - 0.5)
      i2[j] = eps * (rand() - 0.5)
    }
    norm0 = currentNorm()
    computeObservables()
  }

  // nonlinear half-step: ψ_j *= exp(-i dt/2 (1-iγ) V_j)
  function nonlinearHalf() {
    for (let j = 0; j < n; j++) {
      const d1 = r1[j] * r1[j] + i1[j] * i1[j]
      const d2 = r2[j] * r2[j] + i2[j] * i2[j]
      const v1 = g * d1 + g12 * d2
      const v2 = g * d2 + g12 * d1
      const p1 = -0.5 * dt * v1
      const p2 = -0.5 * dt * v2
      const e1 = Math.exp(gamma * p1)
      const e2 = Math.exp(gamma * p2)
      const c1 = e1 * Math.cos(p1)
      const s1 = e1 * Math.sin(p1)
      const c2 = e2 * Math.cos(p2)
      const s2 = e2 * Math.sin(p2)
      let re = r1[j]
      let im = i1[j]
      r1[j] = re * c1 - im * s1
      i1[j] = re * s1 + im * c1
      re = r2[j]
      im = i2[j]
      r2[j] = re * c2 - im * s2
      i2[j] = re * s2 + im * c2
    }
  }

  function kineticFull() {
    fft(r1, i1, false)
    fft(r2, i2, false)
    for (let m = 0; m < n; m++) {
      const kr = kinR[m]
      const ki = kinI[m]
      let re = r1[m]
      let im = i1[m]
      r1[m] = re * kr - im * ki
      i1[m] = re * ki + im * kr
      re = r2[m]
      im = i2[m]
      r2[m] = re * kr - im * ki
      i2[m] = re * ki + im * kr
    }
    fft(r1, i1, true)
    fft(r2, i2, true)
  }

  function renormalize() {
    if (gamma === 0) return
    const f = Math.sqrt(norm0 / currentNorm())
    for (let j = 0; j < n; j++) {
      r1[j] *= f
      i1[j] *= f
      r2[j] *= f
      i2[j] *= f
    }
  }

  seedState(rng(seed))

  return {
    n,
    spin,
    density,
    norm: currentNorm,
    step(steps: number) {
      for (let s = 0; s < steps; s++) {
        nonlinearHalf()
        kineticFull()
        nonlinearHalf()
        renormalize()
      }
      computeObservables()
    },
    quench(newSeed?: number) {
      g12 = g12Im
      seedState(rng(newSeed ?? seed))
    },
    unquench() {
      g12 = g12Mi
    },
  }
}
