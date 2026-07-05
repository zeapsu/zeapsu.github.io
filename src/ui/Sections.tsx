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
import { RESEARCH_TOP, CARD_BASE, CARD_STEP, CLOSING_TOP } from '../layout'

export function ContactLinks() {
  return (
    <nav className="links" aria-label="contact">
      <a href={identity.github}>GitHub</a>
      <a href={identity.linkedin}>LinkedIn</a>
      <a href={`mailto:${identity.email}`}>{identity.email}</a>
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

// Absolute-positioned over PAGES * 100dvh of scroll, riding drei's <Scroll html>.
// dvh, not vh: drei's scroll range is pages * container pixel height (the
// dynamic viewport), while vh is the large viewport on phones — the mismatch
// pushed the closing section past the maximum scroll on mobile.
export function Sections() {
  return (
    <div className="journey">
      <section className="hero" style={{ top: 0 }}>
        <p className="eyebrow">Andry Paez · AI systems + research software</p>
        <h1>{identity.tagline}</h1>
        <ContactLinks />
        <p className="sim-caption">
          <span className="live-dot" aria-hidden="true" /> {identity.simCaption}
        </p>
      </section>

      <section className="panel" style={{ top: `${RESEARCH_TOP}dvh` }}>
        <p className="eyebrow">{research.eyebrow}</p>
        <h2>{research.title}</h2>
        <p>{research.body}</p>
        <ul>
          {research.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      {projects.map((p, i) => (
        <div
          key={p.name}
          className={`card-slot ${i % 2 ? 'right' : 'left'}`}
          style={{ top: `${CARD_BASE + i * CARD_STEP}dvh` }}
        >
          {i === 0 && <p className="eyebrow">projects</p>}
          <ProjectCard p={p} />
        </div>
      ))}

      <section className="panel closing" style={{ top: `${CLOSING_TOP}dvh` }}>
        <p className="eyebrow">{howIWork.eyebrow}</p>
        <h2>{howIWork.title}</h2>
        <p>{howIWork.body}</p>
        <p className="open-to">{footer.line}</p>
        <ContactLinks />
      </section>
    </div>
  )
}

// Plain document-flow version: the ungated recruiter/SEO/no-WebGL path. It
// must carry ALL content (accessibility + crawl floor), so every panel the
// gated experience renders has a plain equivalent here.
export function StaticFallback() {
  return (
    <main className="fallback">
      <section className="hero">
        <p className="eyebrow">Andry Paez · AI systems + research software</p>
        <h1>{identity.tagline}</h1>
        <ContactLinks />
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
        <p className="eyebrow">skill tree</p>
        <h2>One character, four branches</h2>
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
        <p className="eyebrow">achievements</p>
        <h2>Records</h2>
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
        <p className="eyebrow">hardware</p>
        <h2>Reachy Mini on a Jetson Orin Nano</h2>
        {hardware.map((h) => (
          <figure key={h.src} className="hardware">
            <img src={h.src} alt={h.alt} loading="lazy" />
            <figcaption>{h.caption}</figcaption>
          </figure>
        ))}
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
        <p>{contact.resumeNote}</p>
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
