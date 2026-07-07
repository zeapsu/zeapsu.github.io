// Hero placement for the vista, ported from the Blender authoring pass. Coords
// are Blender-space (x, y) with the same scale (1 unit = 1m); VistaWorld grounds
// each to floorH and maps to R3F space. Ground-detail scatter (ferns, grass,
// wildflowers) is generated procedurally in the component so its density can be
// tuned live. `rz` is rotation about the up axis (radians).

import { channelX } from './vistaFloor'

export interface Placed {
  asset: string // glb basename in /vista/props
  x: number
  y: number
  s: number
  rz?: number
  rx?: number // extra tilt (lily lies flat, pillars stand upright)
  yAbs?: number // absolute height instead of ground-following (floating islands)
  on?: 'water' // baseline: sit the base on the water surface (bridges, lilies)
  lift?: number // fine vertical nudge after base-grounding
}

// Trees laid out in DEPTH LAYERS so the valley recedes instead of clustering in
// a near band: big framing trees up front, medium in the midground, then a small
// receding tree-line into the haze. Sizes shrink with distance. All keep clear
// of the river (|x - channelX| > ~5).
export const TREES: Placed[] = [
  // foreground framing (large)
  { asset: 'broadleaf', x: 16, y: 9, s: 3.7, rz: 2.1 },
  { asset: 'oak', x: -15, y: 7, s: 3.2, rz: 0.8 },
  // midground (medium, spread wide) — the two new species (oldtree, poplar)
  // break up the repeats
  { asset: 'willow', x: -8, y: 20, s: 2.5, rz: 3.6 },
  { asset: 'oldtree', x: 14, y: 24, s: 2.4, rz: 1.1 },
  { asset: 'bushtree', x: -19, y: 30, s: 2.1, rz: 1.4 },
  { asset: 'maple', x: 20, y: 36, s: 2.1, rz: 0.2 },
  { asset: 'poplar', x: -13, y: 42, s: 2.6, rz: 0.4 },
  { asset: 'broadleaf', x: 8, y: 46, s: 1.8, rz: 5.0 },
  // far tree-line receding into haze (small)
  { asset: 'poplar', x: -21, y: 56, s: 2.2, rz: 0 },
  { asset: 'pine', x: 17, y: 60, s: 1.6, rz: 0 },
  { asset: 'birch', x: -10, y: 66, s: 1.4, rz: 0.5 },
  { asset: 'oldtree', x: 23, y: 70, s: 1.6, rz: 2.7 },
  { asset: 'birch', x: -25, y: 76, s: 1.3, rz: 3.0 },
  { asset: 'poplar', x: 13, y: 82, s: 1.5, rz: 0 },
  { asset: 'oak', x: -17, y: 88, s: 1.4, rz: 1.2 },
  { asset: 'pine', x: 28, y: 92, s: 1.4, rz: 0 },
]

// bank rocks & cairns, also spread through depth
export const ROCKS: Placed[] = [
  { asset: 'mossy-rock', x: -6, y: 11, s: 1.7 },
  { asset: 'rock-cluster', x: 7, y: 9, s: 1.3 },
  { asset: 'cairn', x: 6, y: 22, s: 1.3 },
  { asset: 'rock-cluster', x: -10, y: 30, s: 1.5 },
  { asset: 'mossy-rock', x: 9, y: 38, s: 1.5 },
  { asset: 'mossy-rock', x: -20, y: 46, s: 2.2 },
  { asset: 'rock-cluster', x: 22, y: 52, s: 1.8 },
  { asset: 'cairn', x: -8, y: 62, s: 1.3 },
  { asset: 'mossy-rock', x: 16, y: 74, s: 1.6 },
]

// distant depth: a mountain WALL pulled forward and scaled up so the back reads
// as a real horizon (not empty), plus tall eroded spires as mid-back verticals.
// Mountains sink slightly (yAbs) so they rise from behind the hills; the far
// pair is smaller/higher to layer the horizon.
export const BACKGROUND: Placed[] = [
  { asset: 'mountain', x: -34, y: 90, s: 33, rz: 0.4, yAbs: -4 },
  { asset: 'mountain2', x: 32, y: 102, s: 40, rz: 2.1, yAbs: -5 },
  { asset: 'mountain', x: 2, y: 120, s: 46, rz: 1.0, yAbs: -7 },
  { asset: 'spire', x: -24, y: 50, s: 5.5, rz: 0.7 },
  { asset: 'spire', x: 27, y: 64, s: 6.5, rz: 2.4 },
]

// hazy focal arch + a field of floating islands stepped back through depth and
// height, so the mid-to-far distance is populated and vast, not empty.
export const FLOATERS: Placed[] = [
  { asset: 'arch', x: 2, y: 68, s: 4.6, rz: 0, yAbs: 11 },
  { asset: 'island', x: -9, y: 60, s: 2.6, rz: 0.6, yAbs: 12 },
  { asset: 'island2', x: 13, y: 72, s: 2.3, rz: 2.2, yAbs: 11 },
  { asset: 'island3', x: -20, y: 86, s: 3.3, rz: 1.1, yAbs: 21 },
  { asset: 'island', x: 24, y: 94, s: 3.6, rz: 3.0, yAbs: 26 },
  { asset: 'island2', x: -7, y: 106, s: 2.9, rz: 2.0, yAbs: 31 },
  { asset: 'island3', x: 18, y: 116, s: 3.1, rz: 0.8, yAbs: 34 },
]

// lily pads drift in the channel; laid flat, resting on the water surface
export const LILIES: Placed[] = [9, 17, 25, 35, 44].map((y, i) => ({
  asset: 'lily',
  x: channelX(y) + (i % 2 ? 1.1 : -1.1),
  y,
  s: 0.7 + (i % 3) * 0.14,
  rx: Math.PI / 2,
  on: 'water',
  lift: -0.05,
}))

// two plank bridges crossing the river, decks riding just above the water.
// rz aligns each deck across the river's local flow direction (channel slope).
export const BRIDGES: Placed[] = [18, 38].map((y) => ({
  asset: 'bridge',
  x: channelX(y),
  y,
  s: 4.6,
  rz: -Math.atan2(channelX(y + 1) - channelX(y - 1), 2),
  on: 'water',
  lift: -0.5,
}))
