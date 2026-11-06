import { PRIMARY_JOB, type JobId } from '../content/jobs'
import {
  research,
  projects,
  questLog,
  achievementGroups,
  contact,
  about,
  resumes,
} from '../content/data'
import { chapters, type Chapter, type SheetId } from '../content/story'
import { ContactLinks, ProjectCard } from './Sections'
import { SkillField } from './SkillField'
import { CloserGlow } from './CloserGlow'

// The single content column, always fully visible. Two orders:
// - story (default): the life chapters in order, each followed by the work
//   sheets that happened during it (story.ts `sheets`), then the closer.
// - work: the classic arc, NOW (present-tense job) → WORK → SKILLS → PATH →
//   RECOGNITION → ABOUT+CONTACT. PATH only appears here; in the story the
//   chapters are the path.
// The active lens never hides anything: it re-sorts projects (matching
// first + glow), lights its skill branch, and swaps the resume.

export type View = 'story' | 'work'

type FixedSheet = SheetId | 'path' | 'closer'
type DeckEntry = FixedSheet | Chapter

function deckOrder(view: View): DeckEntry[] {
  if (view === 'work') return ['now', 'work', 'skills', 'path', 'recognition', 'closer']
  return [...chapters.flatMap((c): DeckEntry[] => [c, ...(c.sheets ?? [])]), 'closer']
}

function sortedProjects(lens: JobId | null) {
  if (!lens) return projects
  return [...projects].sort((a, b) => {
    const av = a.jobs.includes(lens) ? 0 : 1
    const bv = b.jobs.includes(lens) ? 0 : 1
    return av - bv
  })
}

// A chapter of the story: the period as the display numeral in the aside,
// Andry's words in the column. Paragraphs are real DOM text; the numeral is
// aria-hidden because the visually hidden period line reads it out.
function ChapterSheet({ c, theme }: { c: Chapter; theme: 'dark' | 'light' }) {
  return (
    <section
      className="panel reveal anim-chapter panel-split"
      data-theme={theme}
      data-draft={c.draft ? '' : undefined}
    >
      <p className="sr-only">{c.period}</p>
      <h2>{c.title}</h2>
      {c.body.map((para) => (
        <p key={para} className="chapter-para">
          {para}
        </p>
      ))}
      <p className="chapter-period panel-aside" aria-hidden="true">
        {c.period}
      </p>
    </section>
  )
}

export function Panels({
  lens,
  view,
  inverted = false,
}: {
  lens: JobId | null
  view: View
  inverted?: boolean
}) {
  // Sheets alternate dark/light by position, first sheet dark; "lights off"
  // flips every sheet while keeping the alternation.
  const theme = (i: number): 'dark' | 'light' => ((i % 2 === 0) !== inverted ? 'dark' : 'light')
  return (
    <main className="panels">
      {deckOrder(view).map((entry, i) =>
        typeof entry === 'string' ? (
          <Sheet key={entry} id={entry} lens={lens} th={theme(i)} />
        ) : (
          <ChapterSheet key={entry.id} c={entry} theme={theme(i)} />
        ),
      )}
    </main>
  )
}

function Sheet({ id, lens, th }: { id: FixedSheet; lens: JobId | null; th: 'dark' | 'light' }) {
  // The resume always resolves to a focus: the active lens, or the primary one.
  const resumeFocus = lens ?? PRIMARY_JOB
  switch (id) {
    case 'now':
      return (
        <section className="panel reveal anim-now panel-split" data-theme={th}>
          <p className="eyebrow">{research.eyebrow}</p>
          <h2>{research.title}</h2>
          <p>{research.body}</p>
          {/* aria-hidden: the identical fact is read out in the list below */}
          <p className="pull-stat panel-aside" aria-hidden="true">
            <span className="pull-stat-value">
              <span className="stat-live" />
              <span className="stat-formed">{research.pullStat.value}</span>
            </span>
            <span className="pull-stat-label">{research.pullStat.label}</span>
          </p>
          <ul>
            {research.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )
    case 'work':
      return (
        <section className="panel reveal anim-work" data-theme={th}>
          <h2>Selected work</h2>
          <div className="quest-board">
            {sortedProjects(lens).map((p) => (
              <ProjectCard
                key={p.name}
                p={p}
                featured={!!lens && p.jobs.includes(lens)}
                tags={p.jobs}
              />
            ))}
          </div>
        </section>
      )
    case 'skills':
      return (
        <section className="panel reveal anim-skills" data-theme={th}>
          <h2>What I work in</h2>
          {/* the 3D cloud's material colors can't read CSS vars; tell it the
              sheet's effective theme */}
          <SkillField lens={lens} light={th === 'light'} />
        </section>
      )
    case 'path':
      return (
        <section className="panel reveal anim-path panel-split" data-theme={th}>
          <h2>{questLog.title}</h2>
          <p>{questLog.intro}</p>
          {/* not aria-hidden: the quest list inside is real content, only the
              drawn route itself is decorative */}
          <div className="panel-aside route">
            <svg
              className="route-map"
              viewBox="0 0 400 640"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <path
                className="route-line"
                pathLength="1"
                fill="none"
                d="M 60 50 C 50 145, 130 195, 330 225 C 365 295, 250 345, 140 420 C 95 485, 240 540, 300 590"
              />
              <circle className="route-node" cx="60" cy="50" r="7" />
              <circle className="route-node" cx="330" cy="225" r="7" />
              <circle className="route-node" cx="140" cy="420" r="7" />
              <circle className="route-node route-node-active" cx="300" cy="590" r="9" />
            </svg>
            <ol className="quest-chain route-stops">
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
          </div>
        </section>
      )
    case 'recognition':
      return (
        <section className="panel reveal anim-recognition" data-theme={th}>
          <h2>Honors and credentials</h2>
          <div className="trophy-groups">
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
          </div>
        </section>
      )
    case 'closer':
      // ABOUT + CONTACT share the closing sheet: the person, then the
      // essentials. The anim-about choreography keys off the child classes
      // (about-body, contact-lead, links, resume-download, resume-note).
      return (
        <section className="panel reveal anim-about panel-split" data-theme={th}>
          <h2>{about.title}</h2>
          <p className="about-body">{about.body}</p>
          <p className="contact-lead">{contact.body}</p>
          <ContactLinks show={['email']} />
          <p className="resume-download">
            <a className="resume-button" href={resumes[resumeFocus]} target="_blank" rel="noopener">
              Download resume
            </a>
          </p>
          <p className="resume-note">{contact.resumeNote}</p>
          {/* the bookend: the hero split the light, the closer gathers it.
              Decorative; last in DOM so reading and tab order are untouched. */}
          <div className="panel-aside closer-glow-wrap" aria-hidden="true">
            <CloserGlow lens={lens} />
          </div>
        </section>
      )
  }
}
