import { useEffect } from 'react'

// Theme zones: whichever [data-zone] element spans the viewport's vertical
// center drives html[data-theme]. Sections between zones keep the last theme
// (no flicker at borders). rAF-throttled scroll listener over a handful of
// elements — cheaper and steadier than an IO band for this.
export function useThemeZones() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-zone]'))
    if (!els.length) return
    let raf = 0
    const update = () => {
      raf = 0
      const mid = innerHeight / 2
      for (const el of els) {
        const r = el.getBoundingClientRect()
        if (r.top <= mid && r.bottom >= mid) {
          const zone = el.dataset.zone!
          if (document.documentElement.dataset.theme !== zone)
            document.documentElement.dataset.theme = zone
          break
        }
      }
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue, { passive: true })
    return () => {
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
      cancelAnimationFrame(raf)
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
