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
