import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { JOBS, PRIMARY_JOB, type JobId } from '../content/jobs'
import { identity } from '../content/data'
import { ContactLinks } from './Sections'
import { useBeamGeometry } from './dispersion'
import { BeamCanvas } from './BeamCanvas'
import photo from '../assets/portrait.jpg'

const reduced =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

// The cycle leads with the primary focus, then the rest in array order.
const CYCLE: JobId[] = [PRIMARY_JOB, ...JOBS.map((j) => j.id).filter((id) => id !== PRIMARY_JOB)]

// Only "AI Systems Engineer" takes "an"; the other three take "a".
const article = (id: JobId) => (id === 'ai-systems' ? 'an' : 'a')

// The prism hero: white light enters from the left, strikes the portrait,
// and disperses into four wavelength beams — one per facet. The beam-end
// labels are the filter (hover/focus previews, click locks); the headline
// rotator and the brightest beam always agree because both key on `shownId`.
export function Hero({
  locked,
  preview,
  onPreview,
  onLock,
}: {
  locked: JobId | null
  preview: JobId | null
  onPreview: (id: JobId | null) => void
  onLock: (id: JobId) => void
}) {
  const lens = preview ?? locked
  const cycling = lens === null && !reduced

  const [i, setI] = useState(0)
  useEffect(() => {
    if (!cycling) return
    const t = setInterval(() => setI((n) => (n + 1) % CYCLE.length), 2100)
    return () => clearInterval(t)
  }, [cycling])

  // Re-enter the cycle on the primary focus every time we return to idle, so
  // it never resumes mid-rotation on a random role.
  useEffect(() => {
    if (lens === null) setI(0)
  }, [lens])

  const shownId: JobId = lens ?? (reduced ? PRIMARY_JOB : CYCLE[i])
  const shown = JOBS.find((j) => j.id === shownId)!

  const heroRef = useRef<HTMLElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<(HTMLElement | null)[]>([])
  const geom = useBeamGeometry(heroRef, photoRef, btnRefs, copyRef)

  // Idle: the shown beam is brightest, the rest lit low. Engaged: the lens
  // beam is brightest, the rest dim — never off (nothing is ever hidden).
  const beamState = (id: JobId) => (id === shownId ? 'beam-active' : lens ? 'beam-dim' : 'beam-idle')
  // Shader weights mirror the SVG classes: active 1, idle 0.5, dim 0.18.
  const weights = JOBS.map((j) => (j.id === shownId ? 1 : lens ? 0.18 : 0.5))

  return (
    <header className="hero" ref={heroRef}>
      {geom && <BeamCanvas geom={geom} weights={weights} />}
      {geom && (
        <svg
          className="hero-svg"
          aria-hidden="true"
          viewBox={`0 0 ${geom.width} ${geom.height}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* the incident beam carries the whole spectrum (recombination:
                four wavelengths in, one identity) */}
            <linearGradient
              id="spectrum"
              gradientUnits="userSpaceOnUse"
              x1={geom.entry.x1}
              y1={geom.entry.y1}
              x2={geom.entry.x2}
              y2={geom.entry.y2}
            >
              <stop offset="0" stopColor="#ff7a45" />
              <stop offset="0.35" stopColor="#f0a848" />
              <stop offset="0.7" stopColor="#4fd8c8" />
              <stop offset="1" stopColor="#b48cff" />
            </linearGradient>
          </defs>
          <g className="beam beam-entry">
            <line {...seg(geom.entry)} stroke="url(#spectrum)" strokeWidth={7} opacity={0.3} />
            <line {...seg(geom.entry)} stroke="url(#spectrum)" strokeWidth={2} opacity={0.9} />
          </g>
          {JOBS.map((j, idx) => {
            const s = geom.exits[idx]
            if (!s) return null
            return (
              <g key={j.id} className={`beam ${beamState(j.id)}`}>
                <line {...seg(s)} stroke={j.palette.accent} strokeWidth={8} opacity={0.16} />
                <line {...seg(s)} stroke={j.palette.accent} strokeWidth={1.8} />
              </g>
            )
          })}
        </svg>
      )}

      <div className="hero-copy" ref={copyRef}>
        <p className="eyebrow">{identity.name}</p>
        <h1 className="lead">
          Hi, I&rsquo;m Andry.
          {/* the role line is scaled so the longest role ("an AI Systems
              Engineer") stays on one line — switching never changes the
              headline's line count */}
          <span className="role-line">
            I am{' '}
            <span className="role-slot">
              {/* keying on shownId remounts the word so it re-plays the enter
                  animation each cycle; the word wears its own focus hue */}
              <span
                key={shownId}
                className="role"
                style={{ '--facet': shown.palette.accent } as CSSProperties}
              >
                {article(shownId)} {shown.name}
              </span>
            </span>
          </span>
        </h1>
        {/* the description travels with the role — cycling, previewing, and
            locking all swap it together (keyed so it re-fades in step) */}
        <p className="lead-tagline" key={shownId}>
          {shown.tagline}
        </p>
        <ContactLinks show={['github', 'linkedin']} />
      </div>

      <div className="prism-photo" ref={photoRef}>
        <img src={photo} alt="Andry Paez" draggable={false} />
      </div>

      <div className="beam-btns" role="group" aria-label="Filter by focus">
        {JOBS.map((j, idx) => (
          <button
            key={j.id}
            ref={(el) => {
              btnRefs.current[idx] = el
            }}
            type="button"
            className={`beam-btn${j.id === locked ? ' locked' : ''}${j.id === lens ? ' active' : ''}`}
            style={{ '--facet': j.palette.accent } as CSSProperties}
            aria-pressed={j.id === locked}
            onMouseEnter={() => onPreview(j.id)}
            onMouseLeave={() => onPreview(null)}
            onFocus={() => onPreview(j.id)}
            onBlur={() => onPreview(null)}
            onClick={() => onLock(j.id)}
          >
            {j.name}
          </button>
        ))}
      </div>
    </header>
  )
}

function seg(s: { x1: number; y1: number; x2: number; y2: number }) {
  return { x1: s.x1, y1: s.y1, x2: s.x2, y2: s.y2 }
}
