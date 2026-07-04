import { JOBS, type JobId } from '../content/jobs'
import {
  identity,
  research,
  projects,
  questLog,
  skillTree,
  achievements,
  contact,
  howIWork,
} from '../content/data'
import { ContactLinks, ProjectCard } from './Sections'

// The shared skeleton all four jobs render through: About/hero -> quest log ->
// quest board -> skill tree -> achievements -> contact. Theme, ordering, and
// emphasis change per job; the skeleton never does. The equipped job's project
// cards sort first (spec: "the equipped job's cards sort first and glow").

const JOB_TAGS: Record<string, JobId[]> = {
  'reachy-console': ['robotics', 'ai-systems'],
  'Kalshi weather markets': ['ai-systems', 'swe'],
  Sage: ['ai-systems', 'swe'],
  'daily-hub': ['swe'],
  'Quantum computing work': ['physicist'],
}

function sortedProjects(job: JobId | null) {
  if (!job) return projects
  return [...projects].sort((a, b) => {
    const av = JOB_TAGS[a.name]?.includes(job) ? 0 : 1
    const bv = JOB_TAGS[b.name]?.includes(job) ? 0 : 1
    return av - bv
  })
}

export function Panels({ job }: { job: JobId | null }) {
  const equipped = JOBS.find((j) => j.id === job)
  return (
    <main className="panels" inert={job === null || undefined}>
      <section className="game-panel hero-panel">
        <p className="eyebrow">{equipped ? `${equipped.name} · ${equipped.subtitle}` : 'Andry Paez'}</p>
        <h1 className="hero-name">{identity.name}</h1>
        <p className="hero-tagline">{equipped ? equipped.tagline : identity.tagline}</p>
        <ContactLinks />
      </section>

      <section className="game-panel">
        <p className="eyebrow">{research.eyebrow}</p>
        <h2>{research.title}</h2>
        <p>{research.body}</p>
        <ul>
          {research.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <section className="game-panel">
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

      <section className="game-panel">
        <p className="eyebrow">quest board</p>
        <h2>Projects</h2>
        <div className="quest-board">
          {sortedProjects(job).map((p) => (
            <ProjectCard
              key={p.name}
              p={p}
              featured={!!job && JOB_TAGS[p.name]?.includes(job)}
            />
          ))}
        </div>
      </section>

      <section className="game-panel">
        <p className="eyebrow">skill tree</p>
        <h2>One character, four branches</h2>
        <div className="skill-tree">
          {skillTree.map((branch) => (
            <div
              key={branch.job}
              className={`skill-branch${branch.job === job ? ' lit' : ''}`}
            >
              <h3 className="skill-branch-name">{branch.branch}</h3>
              <ul>
                {branch.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="game-panel">
        <p className="eyebrow">achievements</p>
        <h2>Records</h2>
        <div className="trophy-grid">
          {achievements.map((a) => (
            <div key={a.title} className="trophy">
              <span className="trophy-title">{a.title}</span>
              <span className="trophy-detail">{a.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="game-panel">
        <p className="eyebrow">{contact.eyebrow}</p>
        <h2>{contact.title}</h2>
        <p>{contact.body}</p>
        <ContactLinks />
        <p className="resume-note">{contact.resumeNote}</p>
      </section>

      <section className="game-panel">
        <p className="eyebrow">{howIWork.eyebrow}</p>
        <h2>{howIWork.title}</h2>
        <p>{howIWork.body}</p>
      </section>
    </main>
  )
}
