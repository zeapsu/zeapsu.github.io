import { useCallback, useEffect, useRef, useState } from 'react'
import { houseJourney as copy, identity } from '../content/data'
import JourneyVisual from './JourneyVisual'
import { chapterIds } from './path'
import type { JourneyState } from './path'
import './journey.css'

export default function HouseJourney() {
  const [chapter, setChapter] = useState(0)
  const [dark, setDark] = useState(document.documentElement.dataset.theme === 'dark')
  const state = useRef<JourneyState>({ progress: 0, chapter: 0, jump: true })
  const sections = useRef<(HTMLElement | null)[]>([])
  const header = useRef<HTMLElement>(null)
  const progress = useRef<HTMLProgressElement>(null)
  const goTo = useCallback((index: number, focus = true, push = true) => {
    const section = sections.current[index]
    if (!section) return
    state.current.progress = index
    state.current.chapter = index
    state.current.jump = true
    setChapter(index)
    if (push) history.pushState(null, '', `#j-${chapterIds[index]}`)
    window.scrollTo({ top: section.offsetTop - (header.current?.offsetHeight ?? 64), behavior: 'instant' })
    if (focus) section.querySelector<HTMLElement>('h1,h2')?.focus({ preventScroll: true })
  }, [])
  const openDetails = useCallback((index: number) => {
    goTo(index)
    const details = sections.current[index]?.querySelector('details')
    if (details) { details.open = true; details.querySelector('summary')?.focus({ preventScroll: true }) }
  }, [goTo])
  useEffect(() => {
    document.title = copy.title
    document.documentElement.dataset.journey = 'true'
    return () => { delete document.documentElement.dataset.journey }
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1c2b30' : '#f5f1e6')
  }, [dark])
  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const starts = sections.current.map(section => (section?.offsetTop ?? 0) - (header.current?.offsetHeight ?? 64))
      let index = 0
      for (let i = 1; i < starts.length; i++) if (window.scrollY >= starts[i] - 2) index = i
      const span = index < 5 ? starts[index + 1] - starts[index] : 1
      const local = Math.max(0, Math.min(1, (scrollY - starts[index]) / span))
      // Give every chapter a reading dwell, then scrub toward the next stop.
      const travel = Math.max(0, (local - .45) / .55)
      state.current.progress = Math.min(5, index + travel)
      state.current.chapter = index
      setChapter(value => value === index ? value : index)
      if (progress.current) progress.current.value = state.current.progress
    }
    const scroll = () => { if (!frame) frame = requestAnimationFrame(measure) }
    const restore = () => {
      const index = chapterIds.findIndex(id => location.hash === `#j-${id}`)
      if (index >= 0) goTo(index, false, false)
      scroll()
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const detail = document.querySelector<HTMLDetailsElement>('.journey details[open]')
      if (detail) { detail.open = false; detail.querySelector('summary')?.focus({ preventScroll: true }); event.preventDefault() }
    }
    const resize = new ResizeObserver(scroll)
    sections.current.forEach(section => { if (section) resize.observe(section) })
    window.addEventListener('scroll', scroll, { passive: true }); window.addEventListener('resize', scroll)
    window.addEventListener('popstate', restore); document.addEventListener('keydown', escape)
    restore(); measure()
    return () => { cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll); window.removeEventListener('popstate', restore); document.removeEventListener('keydown', escape) }
  }, [goTo])
  return <div className="journey" data-theme={dark ? 'dark' : 'light'} data-chapter={chapterIds[chapter]}>
    <a className="j-skip" href="#j-valley-title">{copy.skip}</a>
    <header ref={header} className="j-header">
      <a className="j-name" href="#j-valley" onClick={event => { event.preventDefault(); goTo(0) }}>{copy.name}</a>
      <nav aria-label="Main navigation"><a href={copy.resumeDownload} target="_blank" rel="noreferrer">{copy.resume}</a><a href="#j-contact" onClick={event => { event.preventDefault(); goTo(5) }}>{copy.contact}</a></nav>
      <button className="j-theme" aria-label={dark ? copy.lightTheme : copy.darkTheme} aria-pressed={dark} onClick={() => setDark(value => !value)}><span aria-hidden="true">{dark ? '☼' : '☾'}</span></button>
    </header>
    <JourneyVisual state={state} chapter={chapter} dark={dark} onDetails={openDetails} />
    <main id="journey-content">
      {copy.chapters.map((item, index) => {
        const id = chapterIds[index]
        const project = index === 3 ? copy.projects.research : index === 4 ? copy.projects.robotics : null
        return <section key={id} id={`j-${id}`} className={`j-chapter j-chapter-${id}`} ref={node => { sections.current[index] = node }} aria-labelledby={`j-${id}-title`}>
          <div className="j-panel">
            {index === 0 ? <h1 id={`j-${id}-title`} tabIndex={-1}>{item.title}</h1> : <h2 id={`j-${id}-title`} tabIndex={-1}>{item.title}</h2>}
            <p className="j-body">{item.body}</p>
            {index === 0 && <p className="j-instruction">{copy.instruction}</p>}
            {index === 2 && <><h3>{copy.skillsHeading}</h3><ul>{copy.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></>}
            {project && <><p className="j-context">{project.context}</p><details>
              <summary>{copy.open}</summary><h3>{copy.contributionHeading}</h3><ul>{project.contributions.map(item => <li key={item}>{item}</li>)}</ul>
              <h3>{copy.toolsHeading}</h3><p>{project.tools}</p>
              {index === 4 && <figure className="j-evidence"><img src={copy.projects.robotics.image} alt={copy.projects.robotics.imageAlt} width="1200" height="771" /><img src={copy.projects.robotics.photo} alt={copy.projects.robotics.photoAlt} width="1050" height="1400" /></figure>}
              <p className="j-note">{project.note}</p><a href={`mailto:${identity.email}?subject=${encodeURIComponent(project.title)}`}>{copy.askLabel} ↗</a>
            </details></>}
            {index === 5 && <><a className="j-email" href={`mailto:${identity.email}`}>{identity.email}</a><div className="j-contact-links"><a href={copy.resumeDownload} target="_blank" rel="noreferrer">{copy.resume}</a><a href={identity.github} target="_blank" rel="noreferrer">{copy.githubLabel}</a></div><button className="j-reset" onClick={() => goTo(0)}>{copy.reset} <span aria-hidden="true">↺</span></button></>}
            {index < 5 && <a className="j-next" href={`#j-${chapterIds[index + 1]}`} onClick={event => { event.preventDefault(); goTo(index + 1) }}>{copy.chapters[index + 1].label} <span aria-hidden="true">↓</span></a>}
          </div>
        </section>
      })}
    </main>
    <nav className="j-chapters" aria-label={copy.navigation}>
      <div className="j-desktop-chapters">{copy.chapters.map((item, index) => <a key={item.label} href={`#j-${chapterIds[index]}`} aria-current={chapter === index ? 'step' : undefined} onClick={event => { event.preventDefault(); goTo(index) }}>{item.label}</a>)}</div>
      <div className="j-mobile-chapters"><button aria-label={copy.previous} disabled={chapter === 0} onClick={() => goTo(chapter - 1)}>←</button><select aria-label={copy.navigation} value={chapter} onChange={event => goTo(Number(event.target.value))}>{copy.chapters.map((item, index) => <option key={item.label} value={index}>{index + 1}. {item.label}</option>)}</select><button aria-label={copy.next} disabled={chapter === 5} onClick={() => goTo(chapter + 1)}>→</button></div>
      <progress ref={progress} max={5} value={state.current.progress} aria-label={copy.navigation} />
    </nav>
  </div>
}
