// The character-select vista heightfield, ported verbatim from the Blender
// authoring pass (floor_h / water_z) plus the "terrain drama" ramps that raise
// the back into the mountains and steepen the outer valley walls. R3F recreates
// the terrain from this rather than importing a baked mesh, so it stays cheap,
// tunable, and the water can follow it. Coordinates are Blender-space (x right,
// y into the scene); VistaWorld maps them to R3F as (x, floorH, -y).

const smooth = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
const smoothstep = (a: number, b: number, x: number) => smooth(clamp01((x - a) / (b - a)))

// The river's centre line. Two sines give a natural meander (a clear S through
// the visible valley) rather than a near-straight channel. Everything keys off
// this — terrain dip, banks, water ribbon, bridges, lilies, grass exclusion —
// so the whole valley winds together.
export const channelX = (y: number) => 3.4 * Math.sin(y * 0.058) + 1.5 * Math.sin(y * 0.13 + 0.8)

// Half-width of the river bed. It widens into a broad pool in the near
// foreground (the reference's foreground pond) and settles to a river upstream.
// Single source of truth for terrain dip, water ribbon, and grass exclusion.
export const channelHalf = (y: number) => 3.4 + 3.2 * smoothstep(12, -14, y)

// Gentle far-back lift only, so the ground rolls up toward the mountain bases
// instead of ending in a hard seam. The old Blender pass also raised steep side
// walls at |x|>22, but in R3F those read as cliffs that make the valley float —
// dropped. Zero under every placed prop (asset zone is |x|<22, y<52).
function drama(_x: number, y: number): number {
  if (y > 60) return smooth(Math.min(1, (y - 60) / 90)) * 7
  return 0
}

export function floorH(x: number, y: number): number {
  const ad = Math.abs(x - channelX(y)) // distance from the winding river
  const bedhalf = channelHalf(y)
  // river corridor: dips in the bed, rises gently to the low banks
  const chan = ad < bedhalf ? -1.7 : Math.min(-1.7 + (ad - bedhalf) * 0.5, 2.2)
  const farrise = Math.min(0.07 * Math.max(0, y + 6), 9.0)
  // banks roll and rise to frame the valley, but the mask keeps the river
  // corridor smooth so the water surface (grounded at channelX) never bobs
  const bank = smoothstep(bedhalf, bedhalf + 7, ad)
  const rise = Math.min(0.11 * Math.max(0, ad - 10), 5.0) * bank
  const hills =
    (1.3 * Math.sin(x * 0.085 + 1.2) * Math.cos(y * 0.045) +
      0.85 * Math.sin(x * 0.05 - y * 0.032 + 2) +
      0.5 * Math.sin(x * 0.18 + y * 0.12)) *
    bank
  const z = chan + farrise + rise + hills
  // NB: no dais pad here — the old flat pad at (|x|<5, -16<y<-6) sat on the
  // river centre line and stepped the water surface up onto it. The carousel
  // dais is Slice B; reintroduce it then, positioned off the river.
  return z + drama(x, y)
}

export const waterZ = (y: number) => floorH(channelX(y), y) + 0.55

// surface normal of the heightfield via finite differences (for slope shading
// and grounding). Returns Blender-space normal; y is the "into-scene" axis.
export function slope(x: number, y: number): number {
  const e = 0.6
  const dzx = (floorH(x + e, y) - floorH(x - e, y)) / (2 * e)
  const dzy = (floorH(x, y + e) - floorH(x, y - e)) / (2 * e)
  return Math.min(1, Math.hypot(dzx, dzy)) // 0 flat .. ~1 steep
}
