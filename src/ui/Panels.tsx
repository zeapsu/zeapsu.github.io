import { PRIMARY_JOB, type JobId } from '../content/jobs'
import {
  research,
  projects,
  questLog,
  achievementGroups,
  contact,
  howIWork,
  resumes,
} from '../content/data'
import { ContactLinks, ProjectCard } from './Sections'
import { SkillField } from './SkillField'

// The single content column, always fully visible. Section order is the
// narrative arc: NOW (present-tense job) → WORK → PATH → RECOGNITION →
// ABOUT+CONTACT. The active lens never hides anything: it re-sorts projects
// (matching first + glow), lights its skill branch, and swaps the resume.

export const JOB_TAGS: Record<string, JobId[]> = {
  'reachy-console': ['robotics', 'ai-systems'],
  'Kalshi weather markets': ['ai-systems', 'swe'],
  Sage: ['ai-systems', 'swe'],
  'daily-hub': ['swe'],
  'Quantum computing work': ['physicist'],
}

function sortedProjects(lens: JobId | null) {
  if (!lens) return projects
  return [...projects].sort((a, b) => {
    const av = JOB_TAGS[a.name]?.includes(lens) ? 0 : 1
    const bv = JOB_TAGS[b.name]?.includes(lens) ? 0 : 1
    return av - bv
  })
}

export function Panels({ lens }: { lens: JobId | null }) {
  // The resume always resolves to a focus: the active lens, or the primary one.
  const resumeFocus = lens ?? PRIMARY_JOB
  return (
    <main className="panels">
      {/* the active wavelength, carried down the page (decorative) */}
      <div className="spine" aria-hidden="true" />

      <section className="panel reveal anim-now" data-theme="dark">
        <p className="eyebrow">{research.eyebrow}</p>
        <h2>{research.title}</h2>
        <p>{research.body}</p>
        {/* aria-hidden: the identical fact is read out in the list below */}
        <p className="pull-stat" aria-hidden="true">
          <span className="pull-stat-value">{research.pullStat.value}</span>
          <span className="pull-stat-label">{research.pullStat.label}</span>
        </p>
        <ul>
          {research.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <section className="panel reveal anim-work" data-theme="light">
        <p className="eyebrow">work</p>
        <h2>Selected work</h2>
        <div className="quest-board">
          {sortedProjects(lens).map((p) => (
            <ProjectCard
              key={p.name}
              p={p}
              featured={!!lens && JOB_TAGS[p.name]?.includes(lens)}
              tags={JOB_TAGS[p.name] ?? []}
            />
          ))}
        </div>
      </section>

      <section className="panel reveal anim-skills" data-theme="dark">
        <p className="eyebrow">skills</p>
        <h2>What I work in</h2>
        <SkillField lens={lens} />
      </section>

      <section className="panel reveal anim-path" data-theme="light">
        <p className="eyebrow">{questLog.eyebrow}</p>
        <h2>{questLog.title}</h2>
        <p>{questLog.intro}</p>
        <ol className="quest-chain">
          {questLog.quests.map((q) => (
            <li key={q.title} className={`quest quest-${q.status}`}>
              <span className="quest-period">{q.period}</span>
              <span className="quest-body">
                <span className="quest-title">
                  {q.title}
                  {q.status === 'active' && <span className="quest-badge">active</span>}
                </span>
                <span className="quest-detail">{q.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel reveal anim-recognition" data-theme="dark">
        <p className="eyebrow">recognition</p>
        <h2>Honors and credentials</h2>
        {achievementGroups.map((g) => (
          <div key={g.label} className="trophy-group">
            <p className="trophy-group-label">{g.label}</p>
            <div className="trophy-grid">
              {g.items.map((a) => {
                const inner = (
                  <>
                    <span className="trophy-title">{a.title}</span>
                    <span className="trophy-detail">{a.detail}</span>
                  </>
                )
                return a.credential ? (
                  <a
                    key={a.title}
                    className="trophy trophy-link"
                    href={a.credential}
                    target="_blank"
                    rel="noopener"
                    aria-label={`${a.title}, ${a.detail}. View credential.`}
                  >
                    {inner}
                    <span className="trophy-view" aria-hidden="true">view credential</span>
                  </a>
                ) : (
                  <div key={a.title} className="trophy">
                    {inner}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="panel reveal anim-about" data-theme="light">
        <p className="eyebrow">about</p>
        <h2>{howIWork.title}</h2>
        <p>{howIWork.body}</p>
      </section>

      <section className="panel reveal anim-contact" data-theme="dark">
        <p className="eyebrow">{contact.eyebrow}</p>
        <h2>{contact.title}</h2>
        <p>{contact.body}</p>
        <ContactLinks show={['email']} />
        <p className="resume-download">
          <a className="resume-button" href={resumes[resumeFocus]} target="_blank" rel="noopener">
            Download resume
          </a>
        </p>
        <p className="resume-note">{contact.resumeNote}</p>
      </section>
    </main>
  )
}
