import { JOBS, type JobId } from '../content/jobs'
import { identity, research, projects, howIWork, footer } from '../content/data'
import { ContactLinks, ProjectCard } from './Sections'

// The shared skeleton all four jobs render through. Phase 1 fills the
// panels that already have audited copy (hero, research, quest board,
// contact); quest log / skill tree / achievements are honest
// under-construction shells until phase 2.
export function Panels({ job }: { job: JobId | null }) {
  const equipped = JOBS.find((j) => j.id === job)
  return (
    <main className="panels" inert={job === null || undefined}>
      <section className="game-panel hero-panel">
        <p className="eyebrow">{equipped ? `${equipped.name} · ${equipped.subtitle}` : 'Andry Paez'}</p>
        <h2>{equipped ? equipped.tagline : identity.tagline}</h2>
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

      <section className="game-panel shell">
        <p className="eyebrow">quest log</p>
        <h2>The route here was not a straight line</h2>
        <p className="under-construction">This panel opens in a coming patch.</p>
      </section>

      <section className="game-panel">
        <p className="eyebrow">quest board</p>
        <h2>Projects</h2>
        <div className="quest-board">
          {projects.map((p) => (
            <ProjectCard key={p.name} p={p} />
          ))}
        </div>
      </section>

      <section className="game-panel shell">
        <p className="eyebrow">skill tree</p>
        <h2>One character, four branches</h2>
        <p className="under-construction">This panel opens in a coming patch.</p>
      </section>

      <section className="game-panel shell">
        <p className="eyebrow">achievements</p>
        <h2>Records</h2>
        <p className="under-construction">This panel opens in a coming patch.</p>
      </section>

      <section className="game-panel">
        <p className="eyebrow">{howIWork.eyebrow}</p>
        <h2>{howIWork.title}</h2>
        <p>{howIWork.body}</p>
        <p className="open-to">{footer.line}</p>
        <ContactLinks />
      </section>
    </main>
  )
}
