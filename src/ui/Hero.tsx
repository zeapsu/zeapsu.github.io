import { useEffect, useState } from 'react'
import { JOBS, PRIMARY_JOB, type JobId } from '../content/jobs'
import { identity } from '../content/data'
import { ContactLinks } from './Sections'
import photo from '../assets/portrait.jpg'

const reduced =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

// The cycle leads with the primary focus, then the rest in array order.
const CYCLE: JobId[] = [PRIMARY_JOB, ...JOBS.map((j) => j.id).filter((id) => id !== PRIMARY_JOB)]

// Only "AI Systems Engineer" takes "an"; the other three take "a".
const article = (id: JobId) => (id === 'ai-systems' ? 'an' : 'a')

// The hero states one identity and cycles its four facets. The role word
// doubles as the filter control: hovering/focusing a chip previews that focus
// (transient), clicking locks it (persistent, clears on re-click). The word
// auto-cycles only while nothing is previewed or locked.
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

  // Re-enter the cycle on the primary focus every time we return to idle, so it
  // never resumes mid-rotation on a random role.
  useEffect(() => {
    if (lens === null) setI(0)
  }, [lens])

  // A locked/previewed focus always wins; otherwise cycle (motion) or hold the
  // primary focus (reduced motion). This keeps the headline honest under
  // reduced motion when a focus is picked.
  const shownId: JobId = lens ?? (reduced ? PRIMARY_JOB : CYCLE[i])
  const shown = JOBS.find((j) => j.id === shownId)!
  // The unified thesis holds while idle; a focus's own tagline appears once you
  // engage that facet.
  const tagline = lens ? shown.tagline : identity.tagline

  return (
    <header className="hero">
      <div className="hero-portrait">
        <img src={photo} alt="Andry Paez" draggable={false} />
      </div>

      <div className="hero-copy">
        <p className="eyebrow">{identity.name}</p>
        <h1 className="lead">
          Hi, I&rsquo;m Andry.
          <br />I am{' '}
          <span className="role-slot">
            {/* keying on shownId remounts the word so it re-plays the enter
                animation each cycle; the word wears its own focus hue */}
            <span key={shownId} className="role" style={{ color: shown.palette.accent }}>
              {article(shownId)} {shown.name}
            </span>
          </span>
        </h1>
        <p className="lead-tagline">{tagline}</p>

        <div className="focus-row" role="group" aria-label="Filter by focus">
          {JOBS.map((j) => (
            <button
              key={j.id}
              type="button"
              className={`focus-chip${j.id === locked ? ' locked' : ''}${j.id === lens ? ' active' : ''}`}
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

        <ContactLinks show={['github', 'linkedin']} />
      </div>
    </header>
  )
}
