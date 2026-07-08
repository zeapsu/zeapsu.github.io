import { useLayoutEffect, useState, type RefObject } from 'react'

export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface BeamGeometry {
  entry: Segment
  exits: Segment[]
  width: number
  height: number
}

// The photo is clipped to a parallelogram (see .prism-photo in index.css):
// polygon(6% 0, 100% 0, 94% 100%, 0 100%). The beams must touch the slanted
// glass edges, so the strike/origin x-positions account for the slant.
const SLANT = 0.08
const STRIKE_T = 0.2 // entry hits the left face at 20% of the photo height
const ORIGIN_T = 0.55 // exits leave the right face at 55%

/** Measures the hero, photo, and role buttons; beams connect their real
 *  positions so DOM layout is the single source of truth. Consumed by the
 *  static SVG (Layer 1) and the shader canvas (Layer 2). */
export function useBeamGeometry(
  hero: RefObject<HTMLElement | null>,
  photo: RefObject<HTMLElement | null>,
  buttons: RefObject<(HTMLElement | null)[]>,
  copy?: RefObject<HTMLElement | null>,
): BeamGeometry | null {
  const [geom, setGeom] = useState<BeamGeometry | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const h = hero.current
      const p = photo.current
      if (!h || !p) return
      const hr = h.getBoundingClientRect()
      const pr = p.getBoundingClientRect()
      const P = {
        left: pr.left - hr.left,
        top: pr.top - hr.top,
        width: pr.width,
        height: pr.height,
      }

      // ≤780px the hero is a vertical stack: light enters from the top-right,
      // strikes the photo's top face, and fans downward to the button row.
      const vertical = matchMedia('(max-width: 780px)').matches

      // Desktop: entry starts near the top-left corner so the diagonal
      // crosses the empty space above the headline, striking the slanted
      // left face of the photo.
      const strike = vertical
        ? { x: P.left + P.width * STRIKE_T + P.width * SLANT, y: P.top + 2 }
        : { x: P.left + P.width * SLANT * (1 - STRIKE_T), y: P.top + P.height * STRIKE_T }
      let entry: Segment = vertical
        ? { x1: hr.width * 0.96, y1: 0, x2: strike.x, y2: strike.y }
        : { x1: 0, y1: hr.height * 0.04, x2: strike.x, y2: strike.y }

      // The beam must never strike through the headline: if the default line
      // would cross the copy block's top-right corner, re-aim the start so
      // the line passes above it (entering from offscreen-top when needed).
      if (!vertical && copy?.current) {
        const cr = copy.current.getBoundingClientRect()
        const C = { x: cr.right - hr.left + 16, y: cr.top - hr.top - 28 }
        if (C.x < strike.x) {
          const yAtC = entry.y1 + ((strike.y - entry.y1) * C.x) / strike.x
          if (yAtC > C.y) {
            // line through C and the strike point, extended back to x = 0
            const y0 = C.y - (C.x * (strike.y - C.y)) / (strike.x - C.x)
            entry = { x1: 0, y1: y0, x2: strike.x, y2: strike.y }
          }
        }
      }

      // exits: one origin on the far face → each button
      const origin = vertical
        ? { x: P.left + P.width * ORIGIN_T, y: P.top + P.height - 2 }
        : {
            x: P.left + P.width * (1 - SLANT * ORIGIN_T),
            y: P.top + P.height * ORIGIN_T,
          }
      const exits = (buttons.current ?? []).map((b) => {
        if (!b) return { x1: origin.x, y1: origin.y, x2: origin.x, y2: origin.y }
        const br = b.getBoundingClientRect()
        return vertical
          ? {
              x1: origin.x,
              y1: origin.y,
              x2: br.left - hr.left + br.width / 2,
              y2: br.top - hr.top - 6,
            }
          : {
              x1: origin.x,
              y1: origin.y,
              x2: br.left - hr.left - 10,
              y2: br.top - hr.top + br.height / 2,
            }
      })

      setGeom({ entry, exits, width: hr.width, height: hr.height })
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (hero.current) ro.observe(hero.current)
    if (photo.current) ro.observe(photo.current)
    for (const b of buttons.current ?? []) if (b) ro.observe(b)
    return () => ro.disconnect()
  }, [hero, photo, buttons])

  return geom
}
