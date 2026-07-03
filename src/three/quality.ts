// Phones ship 3x displays but nobody can see the difference past ~1.5x on a
// moving fog-faded terrain; cap dpr there to cut fragment work ~44% vs 2x.
// ponytail: two independent booleans, not a quality-tier enum; add tiers only
// if a third knob ever needs to co-vary with these.
export function maxDpr(): number {
  try {
    return matchMedia('(pointer: coarse)').matches ? 1.5 : 2
  } catch {
    return 2
  }
}

// MSAA on the bloom composer, only where aliasing is visible. At dpr 2 the
// supersampling already hides stairsteps (verified pixel-identical crops) and
// 4x MSAA costs ~20fps; at dpr 1 (external monitors) the miscible phase shows
// long horizontal staircase edges and 4x is the only thing that cleans them
// (SMAA misses the dim HDR edges, 2x barely helps).
// ponytail: read at mount like everything else; dragging the window to a
// different-dpr monitor needs a reload, same family as the 640px listener.
export function composerSamples(): number {
  try {
    return devicePixelRatio < 1.5 ? 4 : 0
  } catch {
    return 0
  }
}

// Bloom costs fillrate; skip it where it hurts (mobile) or where the GPU is
// actually a software rasterizer (Jetson/CI screenshots run swiftshader).
export function bloomOk(): boolean {
  try {
    if (matchMedia('(pointer: coarse)').matches || innerWidth < 768) return false
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    if (/swiftshader|llvmpipe|software/i.test(renderer)) return false
    return true
  } catch {
    return false
  }
}
