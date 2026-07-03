// Single source of truth for the scroll journey's vertical layout.
// Sections are absolutely positioned in dvh (see Sections.tsx) and drei's
// ScrollControls measures the same dynamic viewport in pixels, so page count
// and section tops must come from one place or they drift apart.
// ponytail: read once at module load, same limitation as reducedMotion in
// App.tsx. CSS media queries track resizes live but these constants cannot,
// so crossing the breakpoint reloads (listener below) — otherwise mobile CSS
// (full-width cards) runs against desktop slot spacing and cards overlap.
export const mobileLayout =
  typeof matchMedia !== 'undefined' && matchMedia('(max-width: 640px)').matches

if (typeof matchMedia !== 'undefined') {
  matchMedia('(max-width: 640px)').addEventListener('change', () => location.reload())
}

const viewportPx = typeof window !== 'undefined' ? window.innerHeight : 900

// Cards have fixed pixel heights (text), so a pure-dvh step collapses below
// card height on short viewports and cards collide. Floor the step at the
// tallest measured card (539px full-width mobile, ~400px desktop) plus room.
const CARD_MAX_PX = mobileLayout ? 560 : 470
export const RESEARCH_TOP = 105
export const CARD_BASE = mobileLayout ? 240 : 210
export const CARD_STEP = Math.max(
  mobileLayout ? 95 : 55,
  Math.ceil((CARD_MAX_PX / viewportPx) * 100),
)
// Closing starts one step after the last card plus a beat of empty terrain,
// and PAGES is derived so it sits framed at full scroll with 5dvh margins.
export const CLOSING_TOP = CARD_BASE + 5 * CARD_STEP + (mobileLayout ? 40 : 20)
export const PAGES = (CLOSING_TOP + 95) / 100
