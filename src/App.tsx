import { useEffect, useState } from 'react'
import { Hero } from './ui/Hero'
import { Panels } from './ui/Panels'
import { StaticFallback } from './ui/Sections'
import { useReveal, useStackedDeck } from './ui/reveal'
import { PRIMARY_JOB, type JobId } from './content/jobs'

// Flat, content-first portfolio: one identity, four facets. No gate, no worlds.
// The hero states "I am a <rotating focus>" and doubles as the filter. A locked
// focus themes the single page accent, sorts projects, lights its skill branch,
// and swaps the resume; nothing is ever hidden. `?plain=1` is the ungated
// plain-text path (a11y + crawl floor).

export default function App() {
  // `locked` is the clicked focus (persists); `preview` is the hovered/focused
  // one (transient). The active lens is preview-over-locked; when neither is
  // set the hero cycles and the accent falls back to the primary focus.
  const [locked, setLocked] = useState<JobId | null>(null)
  const [preview, setPreview] = useState<JobId | null>(null)
  const lens = preview ?? locked
  const accent = lens ?? PRIMARY_JOB

  useEffect(() => {
    document.documentElement.dataset.job = accent
  }, [accent])

  useReveal()
  useStackedDeck()

  if (new URLSearchParams(location.search).has('plain')) return <StaticFallback />

  return (
    <>
      <Hero
        locked={locked}
        preview={preview}
        onPreview={setPreview}
        onLock={(id) => setLocked((cur) => (cur === id ? null : id))}
      />
      <Panels lens={lens} />
    </>
  )
}
