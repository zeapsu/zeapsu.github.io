import { useEffect, useRef, useState } from 'react'
import portrait from '../assets/portrait.jpg'
import { identity, workshopPrototype as copy } from '../content/data'
import { WorkshopVisual } from './WorkshopVisual'
import { getWorkshopAsset } from './asset'
import './workshop.css'

function Star({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1 20 12 31 16 20 20 16 31 12 20 1 16 12 12Z" fill="currentColor" /><path d="m16 7 2.5 6.5L25 16l-6.5 2.5L16 25l-2.5-6.5L7 16l6.5-2.5Z" fill="none" stroke="var(--w-paper)" strokeWidth=".8" /></svg>
}

export default function WorkshopPrototype() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  const [enlarged, setEnlarged] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    document.documentElement.dataset.workshop = 'true'
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.title = 'Andry Paez · Workshop study'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#18242a' : '#f4efe3')
    return () => { delete document.documentElement.dataset.workshop }
  }, [dark])
  useEffect(() => {
    if (enlarged) dialog.current?.showModal()
  }, [enlarged])
  return (
    <div className="workshop" data-theme={dark ? 'dark' : 'light'}>
      <a className="w-skip" href="#workshop-main">Skip to content</a>
      <header className="w-header">
        <a className="w-signature" href="#workshop-main" aria-label="Andry Paez, introduction"><Star /> <span>{copy.name}</span></a>
        <nav aria-label="Main navigation"><a href="#work">{copy.navigation.work}</a><a href="#resume">{copy.navigation.resume}</a><a href={`mailto:${identity.email}`}>{copy.navigation.contact}</a></nav>
        <button className="w-theme" onClick={() => setDark(v => !v)} aria-label={dark ? 'Use light theme' : 'Use dark theme'} aria-pressed={dark}>
          <span aria-hidden="true">{dark ? '☼' : '☾'}</span>
        </button>
      </header>
      <main id="workshop-main">
        <section className="w-hero" aria-labelledby="w-name">
          <div className="w-intro">
            <p className="w-disciplines">{copy.label}</p>
            <h1 id="w-name">{copy.nameLines[0]}<br /><span>{copy.nameLines[1]}</span></h1>
            <p className="w-introduction">{copy.introduction}</p>
            <div className="w-actions"><a className="w-primary" href="#work">{copy.workLabel}<span aria-hidden="true">↘</span></a><a href="#resume">{copy.resumeLabel}<span aria-hidden="true">↗</span></a></div>
            <div className="w-person"><img src={portrait} alt={copy.portraitAlt} width="1120" height="1400" /><p>{copy.education}</p></div>
          </div>
          <figure className="w-visual">
            <WorkshopVisual dark={dark} />
            <figcaption><span>{copy.sceneLabel}</span><span className="w-study-label">{getWorkshopAsset() ? copy.sceneReady : copy.scenePending}</span></figcaption>
          </figure>
        </section>
        <section className="w-work" id="work" aria-labelledby="w-work-title">
          <div className="w-section-title"><Star /><h2 id="w-work-title">{copy.caseStudy.heading}</h2><span className="w-rule" /></div>
          <article className="w-case">
            <div className="w-evidence">
              <figure className="w-hardware"><img src={copy.caseStudy.photo} alt={copy.caseStudy.photoAlt} width="1050" height="1400" loading="lazy" /><figcaption>{copy.caseStudy.photoCaption}</figcaption></figure>
              <figure className="w-interface"><button onClick={() => setEnlarged(true)} aria-label="Enlarge actual Reachy controller screenshot"><img src={copy.caseStudy.image} alt={copy.caseStudy.imageAlt} width="1200" height="771" loading="lazy" /><span aria-hidden="true">↗</span></button><figcaption>{copy.caseStudy.imageCaption}</figcaption></figure>
            </div>
            <div className="w-case-copy"><h3>{copy.caseStudy.name}</h3><p className="w-summary">{copy.caseStudy.summary}</p><ul>{copy.caseStudy.details.map(detail => <li key={detail}>{detail}</li>)}</ul><a className="w-text-link" href={`mailto:${identity.email}?subject=Reachy%20project`}>{copy.caseStudy.linkLabel}<span aria-hidden="true">↗</span></a><p className="w-project-note">{copy.caseStudy.privateNote}</p></div>
          </article>
        </section>
        <footer className="w-footer" id="resume">
          <div><h2>{copy.resumeHeading}</h2><a className="w-mail" href={`mailto:${identity.email}`}>{identity.email}</a><div className="w-footer-links"><a href={copy.resumeDownload} target="_blank" rel="noreferrer">{copy.resumeDownloadLabel} ↗</a><a href={identity.github}>GitHub ↗</a><a href={copy.linkedin}>LinkedIn ↗</a></div><p className="w-resume-note">{copy.resumeNote}</p></div>
          <p className="w-review-note">{copy.reviewNote}</p>
        </footer>
      </main>
      <dialog ref={dialog} className="w-lightbox" aria-label="Actual Reachy controller screenshot" onClose={() => setEnlarged(false)}><button autoFocus onClick={() => dialog.current?.close()} aria-label="Close enlarged screenshot">{copy.screenshotClose} ×</button><img src={copy.caseStudy.image} alt={copy.caseStudy.imageAlt} width="1200" height="771" /></dialog>
    </div>
  )
}
