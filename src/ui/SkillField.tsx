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
// under reduced motion or without WebGL2 (on mobile the 2D field flows into
// wrapped rows per branch). Either way the tokens exist as real DOM text
// (the 2D field directly; the 3D mode via the sr-only list).
export function SkillField({ lens, light = false }: { lens: JobId | null; light?: boolean }) {
  const [mode] = useState<'3d' | '2d'>(() => {
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)
      return '2d'
    try {
      return document.createElement('canvas').getContext('webgl2') ? '3d' : '2d'
    } catch {
      return '2d'
    }
  })
  const wrapRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  // Don't burn GPU while the cloud can't be seen. The sticky skills sheet
  // never leaves the viewport once pinned, so intersection alone can't detect
  // "scrolled past": also watch the next sheet crossing the viewport-top line
  // (rootMargin collapses the root to that line) — once it pins, the cloud is
  // fully covered.
  useEffect(() => {
    if (mode !== '3d' || !wrapRef.current) return
    let seen = false
    let covered = false
    const gate = () => setInView(seen && !covered)
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting
      gate()
    })
    io.observe(wrapRef.current)
    let coverIo: IntersectionObserver | undefined
    const next = document.querySelector('.anim-path')
    if (next) {
      coverIo = new IntersectionObserver(
        ([e]) => {
          covered = e.isIntersecting
          gate()
        },
        { rootMargin: '0px 0px -100% 0px' },
      )
      coverIo.observe(next)
    }
    return () => {
      io.disconnect()
      coverIo?.disconnect()
    }
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
        <SkillCloud3D lens={lens} active={inView} light={light} />
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
