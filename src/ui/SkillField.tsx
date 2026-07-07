import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { JOBS, type JobId } from '../content/jobs'
import { skillTree } from '../content/data'

const SkillCloud3D = lazy(() => import('./SkillCloud3D'))

// Skills as motes suspended in the dispersed light. Real DOM text (a11y
// floor: never canvas-baked), scattered on a jittered grid with slow drift.
// The active facet's motes catch their wavelength; the rest grey out but
// never disappear. On mobile the field collapses to wrapped rows per branch.

// FNV-1a: stable per-token jitter so the scatter never jumps between visits.
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

// Wide cells (few columns) so the longest token can never reach its
// horizontal neighbor; odd rows shift half a cell (checkerboard) so the
// grid reads organic instead of ruled.
const COLS = 4
const ROWS = 10
// Stride co-prime with COLS*ROWS so consecutive tokens land far apart and
// the four wavelengths interleave across the field instead of clustering.
const STRIDE = 17

interface Mote {
  token: string
  left: number // percent
  top: number // percent
  tier: number // 0..2 depth tier (small/mid/near)
  dur: number // drift duration s
  dx: number // drift px
  dy: number
}

function layout(): { job: JobId; branch: string; motes: Mote[] }[] {
  let gi = 0
  return skillTree.map((branch) => ({
    job: branch.job,
    branch: branch.branch,
    motes: branch.skills.map((token) => {
      const slot = (gi++ * STRIDE) % (COLS * ROWS)
      const col = slot % COLS
      const row = Math.floor(slot / COLS)
      const stagger = row % 2 ? 0.2 : -0.2
      const jx = (hash(token) - 0.5) * 0.24
      const jy = (hash(token + 'y') - 0.5) * 0.55
      return {
        token,
        // mapped into a 10–90% band so the longest token never leaves the field
        left: 10 + ((col + 0.5 + stagger + jx) / COLS) * 80,
        top: ((row + 0.5 + jy) / ROWS) * 100,
        tier: Math.floor(hash(token + 't') * 3),
        dur: 7 + hash(token + 'd') * 7,
        dx: (hash(token + 'x') - 0.5) * 16,
        dy: (hash(token + 'v') - 0.5) * 14,
      }
    }),
  }))
}

const TIER_SIZE = [0.7, 0.82, 0.98] // rem — depth via type scale

// The volumetric R3F cloud when it can honor the floors; the flat 2D field
// under reduced motion, without WebGL2, or on small screens (the mobile CSS
// flows the 2D field into wrapped rows per branch — the cloud needs desktop
// room). Either way the tokens exist as real DOM text (the 2D field
// directly; the 3D mode via the sr-only list).
function pickMode(): '3d' | '2d' {
  if (typeof matchMedia === 'undefined') return '2d'
  if (matchMedia('(max-width: 780px)').matches) return '2d'
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return '2d'
  try {
    return document.createElement('canvas').getContext('webgl2') ? '3d' : '2d'
  } catch {
    return '2d'
  }
}

export function SkillField({ lens }: { lens: JobId | null }) {
  const [mode, setMode] = useState<'3d' | '2d'>(pickMode)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  // Re-pick when the viewport crosses the mobile breakpoint (rotation, resize).
  useEffect(() => {
    const mq = matchMedia('(max-width: 780px)')
    const update = () => setMode(pickMode())
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Don't burn GPU while the cloud is off-screen.
  useEffect(() => {
    if (mode !== '3d' || !wrapRef.current) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting))
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [mode])

  if (mode === '2d') return <FlatSkillField lens={lens} />
  return (
    <div className="skill-field skill-field-3d" ref={wrapRef}>
      <ul className="sr-only">
        {skillTree.map((b) => (
          <li key={b.job}>
            {b.branch}: {b.skills.join(', ')}
          </li>
        ))}
      </ul>
      <Suspense fallback={null}>
        <SkillCloud3D lens={lens} active={inView} />
      </Suspense>
    </div>
  )
}

function FlatSkillField({ lens }: { lens: JobId | null }) {
  const groups = useMemo(layout, [])
  return (
    <div className="skill-field">
      {groups.map((g) => (
        <ul
          key={g.job}
          className={`skill-cloud-group${g.job === lens ? ' lit' : ''}${lens && g.job !== lens ? ' dimmed' : ''}`}
          style={{ '--facet': JOBS.find((j) => j.id === g.job)!.palette.accent } as CSSProperties}
          aria-label={g.branch}
        >
          {g.motes.map((m) => (
            <li
              key={m.token}
              style={
                {
                  left: `${m.left}%`,
                  top: `${m.top}%`,
                  fontSize: `${TIER_SIZE[m.tier]}rem`,
                  '--dd': `${m.dur.toFixed(1)}s`,
                  '--dx': `${m.dx.toFixed(1)}px`,
                  '--dy': `${m.dy.toFixed(1)}px`,
                } as CSSProperties
              }
            >
              {m.token}
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}
