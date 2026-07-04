import { useEffect } from 'react'

// TLOU-style threshold: the living world, one quiet prompt, zero chrome.
// Any input advances. Tab is excluded so keyboard users can still reach the
// plain-text link without entering, and modifier chords stay browser-owned.
export function StartScreen({ onAdvance }: { onAdvance: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.key === 'Shift' || e.key === 'Alt' || e.key === 'Control' || e.key === 'Meta') return
      // Enter/Space on the focused plain link should follow the link instead
      if (document.activeElement instanceof HTMLAnchorElement) return
      // without this, Enter's default activation leaks into the job card
      // that autofocuses on the next screen and instantly equips it
      e.preventDefault()
      onAdvance()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onAdvance])

  return (
    <div className="start-screen" onClick={onAdvance}>
      <button type="button" className="start-prompt">
        press any key
      </button>
      <a className="plain-corner" href="?plain=1" onClick={(e) => e.stopPropagation()}>
        view the plain-text version
      </a>
    </div>
  )
}
