// Single source of truth for the scroll journey's vertical layout.
// Sections are absolutely positioned in dvh (see Sections.tsx) and drei's
// ScrollControls measures the same dynamic viewport in pixels, so page count
// and section tops must come from one place or they drift apart.
// ponytail: read once at module load, same limitation as reducedMotion in
// App.tsx — rotating across the 640px breakpoint needs a reload.
export const mobileLayout =
  typeof matchMedia !== 'undefined' && matchMedia('(max-width: 640px)').matches

// Mobile: full-width text wraps tall (worst measured: research panel 729px =
// 110dvh and cards up to 539px = 82dvh on a 660px phone), so spacing
// stretches and the journey gains pages. Desktop unchanged.
export const PAGES = mobileLayout ? 8.5 : 6
export const RESEARCH_TOP = 105
export const CARD_BASE = mobileLayout ? 240 : 210
export const CARD_STEP = mobileLayout ? 95 : 55
// Closing sits framed at the end of the scroll: top = (PAGES-1)*100 + 5,
// so at full scroll it is centered with 5dvh margins (same as desktop).
export const CLOSING_TOP = mobileLayout ? 755 : 505
