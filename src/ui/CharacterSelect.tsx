import { useState } from 'react'
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
}: {
  onEquip: (id: JobId) => void
  remembered: JobId | null
}) {
  // Hover/focus previews a job: portrait crossfades, tokens re-light.
  const [preview, setPreview] = useState<JobId | null>(remembered)
  const active = preview ?? 'base'
  const previewJob = JOBS.find((j) => j.id === preview)

  return (
    <div className="select-screen" data-preview={active}>
      <div className="select-stage">
        <div className="select-portraits" aria-hidden={preview !== null ? undefined : true}>
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
              onMouseEnter={() => setPreview(j.id)}
              onFocus={() => setPreview(j.id)}
              onClick={() => onEquip(j.id)}
            >
              <span className="job-name">{j.name}</span>
              <span className="job-subtitle">{j.subtitle}</span>
              <span className="job-level" aria-label={j.level === 1 ? 'currently leveling' : `level ${j.level} of 4`}>
                {Array.from({ length: 4 }, (_, i) => (
                  <i key={i} className={i < j.level ? 'pip on' : 'pip'} />
                ))}
                {j.level === 1 && <em className="leveling">currently leveling</em>}
              </span>
            </button>
          ))}
        </div>
        <a className="plain-link" href="?plain=1">
          view the plain-text version
        </a>
      </div>
    </div>
  )
}
