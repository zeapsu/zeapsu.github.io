import { useEffect, useRef, useState } from 'react'
import { explorePrototype as copy, identity } from '../content/data'
import type { StationId } from './navigation'
import { useExploreNavigation } from './navigation'
import { ExploreVisual } from './ExploreVisual'
import './explore.css'

const stationIds: StationId[] = ['research', 'robotics']

export default function ExplorePrototype() {
  const { station, reason, select, back } = useExploreNavigation()
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  const [hover, setHover] = useState<StationId | null>(null)
  const projectHeading = useRef<HTMLHeadingElement>(null)
  const researchButton = useRef<HTMLButtonElement>(null)
  const roboticsButton = useRef<HTMLButtonElement>(null)
  const lastStation = useRef<StationId>('research')
  useEffect(() => {
    document.documentElement.dataset.explore = 'true'
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.title = copy.title
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#17272d' : '#f1eee4')
    return () => { delete document.documentElement.dataset.explore }
  }, [dark])
  useEffect(() => {
    if (station) { lastStation.current = station; projectHeading.current?.focus() }
    else if (reason !== 'initial') (lastStation.current === 'research' ? researchButton : roboticsButton).current?.focus({ preventScroll: true })
    setHover(null)
  }, [station, reason])
  const project = station ? copy.stations[station] : null
  return <div className="explore" data-theme={dark ? 'dark' : 'light'} data-selection={station ?? 'overview'}>
    <a className="x-skip" href="#project-navigation">{copy.skip}</a>
    <header className="x-header">
      <a className="x-name" href="?explore=1" onClick={event => { event.preventDefault(); select(null) }}>{copy.name}<span aria-hidden="true">✧</span></a>
      <nav aria-label="Main navigation"><a href="?explore=1" onClick={event => { event.preventDefault(); select(null) }}>{copy.navigation.work}</a><a href={copy.resumeDownload} target="_blank" rel="noreferrer">{copy.navigation.resume}</a><a href={`mailto:${identity.email}`}>{copy.navigation.contact}</a></nav>
      <button className="x-theme" aria-label={dark ? copy.lightTheme : copy.darkTheme} aria-pressed={dark} onClick={() => setDark(value => !value)}><span aria-hidden="true">{dark ? '☼' : '☾'}</span></button>
    </header>
    <main className={`x-experience ${station ? 'x-has-project' : ''}`}>
      <section className="x-stage" aria-label={copy.sceneLabel}>
        {!station && <div className="x-intro"><h1>{copy.introduction}</h1><p>{copy.education}</p></div>}
        <ExploreVisual station={station} hover={hover} dark={dark} onSelect={select} onHover={setHover} />
        <nav className="x-project-navigation" id="project-navigation" aria-label={copy.stationNavigation} tabIndex={-1}>
          <button aria-pressed={!station} onClick={() => select(null)}>{copy.overview}</button>
          <button ref={researchButton} aria-pressed={station === 'research'} onClick={() => select('research')} onFocus={() => setHover('research')} onBlur={() => setHover(null)}>{copy.stations.research.label}</button>
          <button ref={roboticsButton} aria-pressed={station === 'robotics'} onClick={() => select('robotics')} onFocus={() => setHover('robotics')} onBlur={() => setHover(null)}>{copy.stations.robotics.label}</button>
        </nav>
        <p className="x-instruction">{station ? copy.stations[station].shortTitle : copy.instruction}</p>
      </section>
      {project && station && <section className="x-project" aria-labelledby="x-project-title" key={station}>
        <button className="x-back" onClick={back} aria-label={copy.backLabel}><span aria-hidden="true">←</span> {copy.back}</button>
        <p className="x-context">{project.context}</p>
        <h2 id="x-project-title" ref={projectHeading} tabIndex={-1}>{project.title}</h2>
        <p className="x-summary">{project.summary}</p>
        <h3>{copy.contributionHeading}</h3>
        <ul>{project.contributions.map(item => <li key={item}>{item}</li>)}</ul>
        <h3>{copy.toolsHeading}</h3><p className="x-tools">{project.tools}</p>
        {station === 'robotics' && <figure className="x-evidence"><img src={copy.stations.robotics.image} alt={copy.stations.robotics.imageAlt} width="1200" height="771" /><img className="x-hardware" src={copy.stations.robotics.photo} alt={copy.stations.robotics.photoAlt} width="1050" height="1400" /></figure>}
        <p className="x-note">{project.note}</p>
        <a className="x-project-contact" href={`mailto:${identity.email}?subject=${encodeURIComponent(project.title)}`}>{copy.askLabel} <span aria-hidden="true">↗</span></a>
        <div className="x-next"><h3>{copy.nextHeading}</h3>{stationIds.filter(id => id !== station).map(id => <button key={id} onClick={() => select(id)}>{copy.stations[id].label} <span aria-hidden="true">→</span></button>)}</div>
      </section>}
    </main>
    <p className="x-study-note">{copy.studyNote}</p>
  </div>
}
