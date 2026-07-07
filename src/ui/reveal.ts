import { useEffect } from 'react'

// Stacked deck: every panel is sticky, so each section pins while the next
// slides over it. A panel taller than the viewport must scroll through
// before pinning, which needs its own height: top = -(height - viewport),
// kept fresh per panel via ResizeObserver and read by the CSS as
// var(--stick-top). Mobile CSS ignores the variable (panels aren't sticky).
export function useStackedDeck() {
  useEffect(() => {
    const panels = Array.from(document.querySelectorAll<HTMLElement>('.panels .panel'))
    if (!panels.length) return
    const set = () => {
      for (const p of panels) {
        const over = p.offsetHeight - innerHeight
        p.style.setProperty('--stick-top', over > 0 ? `${-over}px` : '0px')
      }
    }
    set()
    const ro = new ResizeObserver(set)
    panels.forEach((p) => ro.observe(p))
    addEventListener('resize', set, { passive: true })
    return () => {
      ro.disconnect()
      removeEventListener('resize', set)
    }
  }, [])
}

// Reveal-on-scroll: add `.in-view` to every `.reveal` element as it enters the
// viewport, then stop watching it (fires once). One shared observer. Elements
// already on-screen fire immediately (IntersectionObserver reports initial
// intersection on observe). Reduced-motion or no-IO: reveal everything at once.
export function useReveal() {
  useEffect(() => {
    // `.reveal` panels fade up; `.panel h2` headings additionally "catch the
    // light" (a one-shot brightness sweep) when they enter view.
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal, .panel h2'))
    if (!els.length) return

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in-view'))
      return
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in-view')
            obs.unobserve(e.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
