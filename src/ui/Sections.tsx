import { identity, research, projects, howIWork, footer } from '../content/data'

export function ContactLinks() {
  return (
    <nav className="links" aria-label="contact">
      <a href={identity.github}>GitHub</a>
      <a href={identity.linkedin}>LinkedIn</a>
      <a href={`mailto:${identity.email}`}>{identity.email}</a>
    </nav>
  )
}

export function ProjectCard({ p }: { p: (typeof projects)[number] }) {
  return (
    <article className="card">
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

// Absolute-positioned over 600vh of scroll (6 pages), riding drei's <Scroll html>.
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

      <section className="panel" style={{ top: '105vh' }}>
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
          style={{ top: `${210 + i * 55}vh` }}
        >
          {i === 0 && <p className="eyebrow">projects</p>}
          <ProjectCard p={p} />
        </div>
      ))}

      <section className="panel closing" style={{ top: '505vh' }}>
        <p className="eyebrow">{howIWork.eyebrow}</p>
        <h2>{howIWork.title}</h2>
        <p>{howIWork.body}</p>
        <p className="open-to">{footer.line}</p>
        <ContactLinks />
      </section>
    </div>
  )
}

// Plain document-flow version for when WebGL is unavailable.
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
      <p className="eyebrow">projects</p>
      {projects.map((p) => (
        <ProjectCard key={p.name} p={p} />
      ))}
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
