// Hero placement for the vista, ported from the Blender authoring pass. Coords
// are Blender-space (x, y) with the same scale (1 unit = 1m); VistaWorld grounds
// each to floorH and maps to R3F space. Ground-detail scatter (ferns, grass,
// wildflowers) is generated procedurally in the component so its density can be
// tuned live. `rz` is rotation about the up axis (radians).

export interface Placed {
  asset: string // glb basename in /vista/props
  x: number
  y: number
  s: number
  rz?: number
  rx?: number // extra tilt (lily lies flat, pillars stand upright)
  yAbs?: number // absolute height instead of ground-following (floating islands)
}

// 13 trees across 7 species: spaced, varied by size/distance, bigger in front
export const TREES: Placed[] = [
  { asset: 'oak', x: -13, y: 6, s: 3.2, rz: 0.8 },
  { asset: 'broadleaf', x: 14, y: 8, s: 3.4, rz: 2.1 },
  { asset: 'bushtree', x: -19, y: 16, s: 2.2, rz: 1.4 },
  { asset: 'broadleaf', x: 19, y: 12, s: 2.3, rz: 0.2 },
  { asset: 'willow', x: -6.6, y: 14, s: 2.4, rz: 3.6 },
  { asset: 'maple', x: -15, y: 24, s: 2.3, rz: 5.0 },
  { asset: 'maple', x: 16, y: 22, s: 2.5, rz: 1.1 },
  { asset: 'willow', x: 6.6, y: 30, s: 2.2, rz: 0.4 },
  { asset: 'pine', x: -12, y: 38, s: 2.0, rz: 0.0 },
  { asset: 'pine', x: 13, y: 40, s: 2.1, rz: 0.0 },
  { asset: 'bushtree', x: 15, y: 34, s: 1.9, rz: 2.7 },
  { asset: 'birch', x: -17, y: 46, s: 1.7, rz: 0.5 },
  { asset: 'birch', x: 18, y: 48, s: 1.7, rz: 3.0 },
]

// bank rocks & cairns
export const ROCKS: Placed[] = [
  { asset: 'mossy-rock', x: -6, y: 10, s: 1.7 },
  { asset: 'cairn', x: 6, y: 20, s: 1.3 },
  { asset: 'rock-cluster', x: -9, y: 28, s: 1.5 },
  { asset: 'mossy-rock', x: 8, y: 36, s: 1.5 },
  { asset: 'rock-cluster', x: 6, y: 8, s: 1.3 },
  { asset: 'cairn', x: -6, y: 40, s: 1.2 },
  { asset: 'mossy-rock', x: -20, y: 42, s: 2.2 },
  { asset: 'rock-cluster', x: 20, y: 30, s: 1.8 },
]

// distant depth: mountain massifs, tall spires and eroded pillars framing the
// valley. Mountains sink slightly (yAbs offsets) so they rise from behind hills.
export const BACKGROUND: Placed[] = [
  { asset: 'mountain', x: -30, y: 108, s: 24, rz: 0.4, yAbs: -3 },
  { asset: 'mountain', x: 34, y: 116, s: 30, rz: 2.1, yAbs: -4 },
  { asset: 'mountain', x: 6, y: 132, s: 34, rz: 1.0, yAbs: -5 },
  { asset: 'spire', x: -22, y: 44, s: 5.5, rz: 0.7 },
  { asset: 'spire', x: 24, y: 60, s: 7.0, rz: 2.4 },
  // TODO: pillars dropped until re-exported upright from Blender (long axis was
  // baked along X, not the rx guess). Re-add once the foundry orientation is fixed.
]

// hazy focal arch + floating islands (absolute heights: they hover)
export const FLOATERS: Placed[] = [
  { asset: 'arch', x: 2, y: 56, s: 4.5, rz: 0, yAbs: 9 },
  { asset: 'island', x: -8, y: 62, s: 3.0, rz: 0.6, yAbs: 13 },
  { asset: 'island', x: 12, y: 66, s: 2.4, rz: 2.2, yAbs: 11 },
  { asset: 'island', x: -18, y: 80, s: 3.4, rz: 1.1, yAbs: 22 },
  { asset: 'island', x: 22, y: 88, s: 3.8, rz: 3.0, yAbs: 26 },
]

// lily pads drift in the channel; grounded to the water surface + laid flat
export const LILIES: Placed[] = [9, 17, 25, 35, 44].map((y, i) => ({
  asset: 'lily',
  x: 2.5 * Math.sin(y * 0.035) + (i % 2 ? 1.1 : -1.1),
  y,
  s: 0.7 + (i % 3) * 0.14,
  rx: Math.PI / 2,
}))

// two plank bridges crossing the river
export const BRIDGES: Placed[] = [18, 38].map((y) => ({
  asset: 'bridge',
  x: 2.5 * Math.sin(y * 0.035),
  y,
  s: 4.6,
  rz: 0,
}))
