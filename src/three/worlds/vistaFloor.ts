// The character-select vista heightfield, ported verbatim from the Blender
// authoring pass (floor_h / water_z) plus the "terrain drama" ramps that raise
// the back into the mountains and steepen the outer valley walls. R3F recreates
// the terrain from this rather than importing a baked mesh, so it stays cheap,
// tunable, and the water can follow it. Coordinates are Blender-space (x right,
// y into the scene); VistaWorld maps them to R3F as (x, floorH, -y).

const smooth = (t: number) => t * t * (3 - 2 * t)

export const channelX = (y: number) => 2.5 * Math.sin(y * 0.035)

// Gentle far-back lift only, so the ground rolls up toward the mountain bases
// instead of ending in a hard seam. The old Blender pass also raised steep side
// walls at |x|>22, but in R3F those read as cliffs that make the valley float —
// dropped. Zero under every placed prop (asset zone is |x|<22, y<52).
function drama(_x: number, y: number): number {
  if (y > 60) return smooth(Math.min(1, (y - 60) / 90)) * 7
  return 0
}

export function floorH(x: number, y: number): number {
  const ad = Math.abs(x - channelX(y))
  const bedhalf = 3.4
  const chan = ad < bedhalf ? -1.7 : Math.min(-1.7 + (ad - bedhalf) * 0.55, 3.0)
  const farrise = Math.min(0.07 * Math.max(0, y + 6), 9.0)
  const hills = 0.8 * Math.sin(x * 0.07 + 1) * Math.cos(y * 0.05) + 0.4 * Math.sin(x * 0.15 + y * 0.1)
  let z = chan + farrise + hills * 0.5
  if (y > -16 && y < -6 && Math.abs(x) < 5.0) z = 0.0 // dais pad
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
