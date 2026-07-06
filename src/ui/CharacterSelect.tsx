import { useRef, type CSSProperties } from 'react'
import { JOBS, type JobId } from '../content/jobs'
import { identity } from '../content/data'
import base from '../assets/portraits/base.jpg'
import physicist from '../assets/portraits/physicist.jpg'
import aiSystems from '../assets/portraits/ai-systems.jpg'
import swe from '../assets/portraits/swe.jpg'
import robotics from '../assets/portraits/robotics.jpg'

const PORTRAITS: Record<'base' | JobId, string> = {
  base,
  physicist,
  'ai-systems': aiSystems,
  swe,
  robotics,
}

export function CharacterSelect({
  onEquip,
  remembered,
  preview,
  onPreview,
  leaving = false,
  flash = false,
}: {
  onEquip: (id: JobId) => void
  remembered: JobId | null
  preview: JobId | null
  onPreview: (id: JobId | null) => void
  leaving?: boolean
  /** arriving from the dive: emerge from a closing white-out */
  flash?: boolean
}) {
  // Hover/focus previews a job: portrait crossfades, chrome AND world re-light.
  // The initial programmatic autofocus is ignored so the base portrait gets
  // its beat before the remembered job takes over (phase-1 carryover fix).
  const sawAutoFocus = useRef(false)
  const active = preview ?? 'base'
  const previewJob = JOBS.find((j) => j.id === preview)

  return (
    <div
      className={`select-screen${leaving ? ' equip-out' : ''}`}
      style={
        previewJob
          ? ({
              '--accent': previewJob.palette.accent,
              '--accent-dim': previewJob.palette.accentDim,
              '--bg0': previewJob.palette.bg0,
              '--bg1': previewJob.palette.bg1,
            } as CSSProperties)
          : undefined
      }
    >
      <div className="select-stage">
        <div className="select-portraits">
          {(Object.keys(PORTRAITS) as Array<'base' | JobId>).map((k) => (
            <img
              key={k}
              src={PORTRAITS[k]}
              alt={k === active ? 'Painted portrait of Andry Paez' : ''}
              className={k === active ? 'active' : ''}
              draggable={false}
            />
          ))}
        </div>
        <p className="eyebrow">character select</p>
        <h1 className="nameplate">{identity.name}</h1>
        <p className="select-tagline">{previewJob ? previewJob.tagline : identity.tagline}</p>
        <div className="job-cards">
          {JOBS.map((j) => (
            <button
              key={j.id}
              type="button"
              className={`job-card${j.id === remembered ? ' remembered' : ''}`}
              autoFocus={j.id === (remembered ?? JOBS[0].id)}
              onMouseEnter={() => onPreview(j.id)}
              onFocus={() => {
                if (!sawAutoFocus.current) {
                  sawAutoFocus.current = true
                  return
                }
                onPreview(j.id)
              }}
              onClick={() => onEquip(j.id)}
            >
              <span className="job-name">{j.name}</span>
              <span className="job-subtitle">{j.subtitle}</span>
              <span
                className="job-level"
                role="img"
                aria-label={j.level === 1 ? 'currently leveling' : `level ${j.level} of 4`}
              >
                {Array.from({ length: 4 }, (_, i) => (
                  <i key={i} className={i < j.level ? 'pip on' : 'pip'} />
                ))}
                {j.level === 1 && <em className="leveling">currently leveling</em>}
              </span>
              {j.id === remembered && <span className="remembered-tag">last played</span>}
            </button>
          ))}
        </div>
        <a className="plain-link" href="?plain=1">
          view the plain-text version
        </a>
        <p className="aurora-caption">
          <span className="live-dot" aria-hidden="true" /> {identity.auroraCaption}
        </p>
      </div>
      {flash && <div className="select-whiteout" aria-hidden="true" />}
    </div>
  )
}
