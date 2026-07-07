import {
  identity,
  research,
  projects,
  questLog,
  skillTree,
  achievements,
  contact,
  howIWork,
  footer,
  resumes,
  resumeDefault,
  hardware,
} from '../content/data'
import { JOBS } from '../content/jobs'

type LinkKey = 'github' | 'linkedin' | 'email'

// One nav, optionally filtered. Callers with no `show` get all three (the
// plain fallback); the main page splits them so no link repeats (#20):
// hero = github+linkedin, contact = email.
export function ContactLinks({ show }: { show?: LinkKey[] } = {}) {
  const on = (k: LinkKey) => !show || show.includes(k)
  return (
    <nav className="links" aria-label="contact">
      {on('github') && <a href={identity.github}>GitHub</a>}
      {on('linkedin') && <a href={identity.linkedin}>LinkedIn</a>}
      {on('email') && <a href={`mailto:${identity.email}`}>{identity.email}</a>}
    </nav>
  )
}

export function ProjectCard({
  p,
  featured = false,
}: {
  p: (typeof projects)[number]
  featured?: boolean
}) {
  return (
    <article className={`card${featured ? ' featured' : ''}`}>
      {p.image && (
        <figure className="card-shot">
          <img src={p.image} alt={p.imageAlt ?? `${p.name} screenshot`} loading="lazy" />
        </figure>
      )}
      <header>
        <h3>{p.link ? <a href={p.link}>{p.name}</a> : p.name}</h3>
        <span className="status">{p.status}</span>
      </header>
      <p>{p.blurb}</p>
      <ul>
        {p.facts.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </article>
  )
}

// The Roboticist "real bench" figure. Shared so the main page and the
// ?plain=1 fallback never drift; each caller wraps it in its own <section>.
// width/height are set so the lazy photos reserve space (no layout shift).
export function HardwareFigures() {
  return (
    <>
      <p className="eyebrow">hardware</p>
      <h2>Reachy Mini on a Jetson Orin Nano</h2>
      <div className="hardware-figures">
        {hardware.map((h) => (
          <figure key={h.src} className="hardware">
            <img src={h.src} alt={h.alt} width={h.w} height={h.h} loading="lazy" />
            <figcaption>{h.caption}</figcaption>
          </figure>
        ))}
      </div>
    </>
  )
}

// Plain document-flow version: the ungated recruiter/SEO/no-JS path. It must
// carry ALL content (accessibility + crawl floor), so every section the main
// page renders has a plain equivalent here.
export function StaticFallback() {
  return (
    <main className="fallback">
      <section className="hero">
        <p className="eyebrow">Andry Paez · AI systems + research software</p>
        <h1>{identity.tagline}</h1>
        <ContactLinks />
        <a className="plain-link" href="./">back to the interactive site</a>
      </section>

      <section className="panel">
        <p className="eyebrow">{research.eyebrow}</p>
        <h2>{research.title}</h2>
        <p>{research.body}</p>
        <ul>
          {research.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <p className="eyebrow">{questLog.eyebrow}</p>
        <h2>{questLog.title}</h2>
        <p>{questLog.intro}</p>
        <ul>
          {questLog.quests.map((q) => (
            <li key={q.title}>
              <strong>{q.period}</strong>, {q.title}: {q.detail}
            </li>
          ))}
        </ul>
      </section>

      <p className="eyebrow">projects</p>
      {projects.map((p) => (
        <ProjectCard key={p.name} p={p} />
      ))}

      <section className="panel">
        <p className="eyebrow">skills</p>
        <h2>What I work in</h2>
        {skillTree.map((branch) => (
          <div key={branch.job}>
            <h3>{branch.branch}</h3>
            <ul>
              {branch.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="panel">
        <p className="eyebrow">recognition</p>
        <h2>Honors and credentials</h2>
        <ul>
          {achievements.map((a) => (
            <li key={a.title}>
              <strong>{a.title}</strong>: {a.detail}
              {a.credential && (
                <>
                  {' '}
                  <a href={a.credential} target="_blank" rel="noopener">
                    view credential
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <HardwareFigures />
      </section>

      <section className="panel">
        <p className="eyebrow">{contact.eyebrow}</p>
        <h2>{contact.title}</h2>
        <p>{contact.body}</p>
        <ContactLinks />
        <p>Resumes: <a href={resumeDefault} target="_blank" rel="noopener">full CV</a>{' '}
          {JOBS.map((j) => (
            <span key={j.id}>
              · <a href={resumes[j.id]} target="_blank" rel="noopener">{j.name}</a>{' '}
            </span>
          ))}
        </p>
      </section>

      <section className="panel closing">
        <p className="eyebrow">{howIWork.eyebrow}</p>
        <h2>{howIWork.title}</h2>
        <p>{howIWork.body}</p>
        <p className="open-to">{footer.line}</p>
        <ContactLinks />
      </section>
    </main>
  )
}
