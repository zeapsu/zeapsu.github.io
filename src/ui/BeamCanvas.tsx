import { useEffect, useRef } from 'react'
import { JOBS } from '../content/jobs'
import type { BeamGeometry } from './dispersion'

// Layer 2 of the dispersion hero: a single WebGL2 fragment-shader quad that
// adds volumetric light, dust motes drifting in the beams, shimmer, and
// pointer parallax behind the DOM. Progressive enhancement only — without
// WebGL2 the static SVG (Layer 1) carries the visual, and under reduced
// motion exactly one formed frame is rendered (no loop, no shimmer motion).

const VERT = `#version 300 es
void main() {
  // fullscreen triangle
  vec2 v = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(v * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uSize;      // hero size in CSS px
uniform float uDpr;
uniform float uTime;
uniform vec2 uPointer;   // 0..1, eased
uniform vec2 uEntryA, uEntryB, uOrigin;
uniform vec2 uExit[4];
uniform vec3 uColor[4];
uniform float uWeight[4];
uniform float uWhite;
uniform float uLightMode; // 0 = additive over dark, 1 = absorption on paper

float segDist(vec2 p, vec2 a, vec2 b, out float t) {
  vec2 pa = p - a, ba = b - a;
  t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
  return length(pa - ba * t);
}

// Additive glow around a segment: tight core + wide halo, igniting near the
// source and decaying along the length.
float beam(vec2 p, vec2 a, vec2 b, float core, float halo) {
  float t;
  float d = segDist(p, a, b, t);
  float fall = smoothstep(0.0, 0.10, t) * (1.0 - 0.30 * t);
  return (exp(-d * core) + 0.18 * exp(-d * halo)) * fall;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Sparse drifting motes: one candidate per grid cell, kept for ~35% of cells.
float dust(vec2 p, float t, float cell, vec2 drift) {
  vec2 q = (p + drift * t) / cell;
  vec2 id = floor(q);
  vec2 f = fract(q);
  if (hash(id) > 0.35) return 0.0;
  vec2 c = vec2(hash(id + 7.3), hash(id + 3.1)) * 0.8 + 0.1;
  float tw = 0.75 + 0.25 * sin(t * (1.0 + hash(id + 11.0)) * 2.2 + hash(id) * 6.28);
  return smoothstep(0.09, 0.0, length(f - c)) * tw;
}

void main() {
  // CSS-px coords, y-down, matching the measured DOM geometry
  vec2 p = vec2(gl_FragCoord.x / uDpr, uSize.y - gl_FragCoord.y / uDpr);
  p += (uPointer - 0.5) * 14.0; // parallax

  vec3 col = vec3(0.0);     // additive light (dark theme, screen blend)
  vec3 absorb = vec3(0.0);  // pigment (light theme, multiply blend)
  float field = 0.0;

  // white entry light; on paper it reads as a neutral glass caustic
  float wb = beam(p, uEntryA, uEntryB, 0.07, 0.010) * uWhite;
  col += vec3(0.92, 0.90, 0.97) * wb * 1.05;
  absorb += vec3(0.13, 0.12, 0.16) * wb * 0.8;
  field += wb;

  // four dispersed wavelengths, gently shimmering
  vec3 tint = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float w = uWeight[i] * (0.94 + 0.06 * sin(uTime * 1.7 + float(i) * 2.1));
    float b = beam(p, uOrigin, uExit[i], 0.055, 0.008) * w;
    col += uColor[i] * b * 1.5;
    absorb += (vec3(1.0) - uColor[i]) * b * 1.2; // subtractive: rainbow on paper
    field += b;
    tint += uColor[i] * w;
  }

  // faint atmosphere so the whole field feels lit by the dispersed hues
  float vign = 1.0 - smoothstep(0.2, 0.85, length((p / uSize) - vec2(0.62, 0.45)));
  col += tint * 0.012 * vign;
  absorb += (vec3(1.0) - tint / 4.0) * 0.008 * vign;

  // dust only sparkles inside the light (additive theme only)
  float motes = dust(p, uTime, 26.0, vec2(9.0, 2.5)) + dust(p, uTime, 47.0, vec2(-5.0, 4.0));
  col += vec3(0.95) * motes * min(field * 1.6, 1.0) * 0.9;

  // soften the canvas' bottom boundary so the light never ends on a hard line
  float edge = smoothstep(uSize.y, uSize.y - 110.0, p.y);
  col *= edge;
  absorb *= edge;

  // fine grain dithers the halo tails; strongest where the light is dim
  float g = (hash(gl_FragCoord.xy + fract(uTime)) - 0.5);
  col += g * mix(0.02, 0.006, min(field, 1.0));

  vec3 dark = max(col, 0.0);
  vec3 paper = vec3(1.0) - min(absorb, vec3(0.8)) + g * 0.012;
  outColor = vec4(mix(dark, paper, uLightMode), 1.0);
}`

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function BeamCanvas({ geom, weights }: { geom: BeamGeometry; weights: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Live targets read by the render loop without re-creating the GL state.
  const targets = useRef({ geom, weights })
  targets.current = { geom, weights }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Opaque + CSS mix-blend-mode:screen — black is a no-op over the page,
    // light adds. Avoids non-premultiplied-alpha compositing pitfalls.
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false })
    if (!gl) {
      canvas.style.display = 'none' // SVG carries the visual
      return
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(s) ?? 'shader compile failed')
      return s
    }
    let prog: WebGLProgram
    try {
      prog = gl.createProgram()!
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(prog) ?? 'link failed')
    } catch (err) {
      // The SVG layer carries the visual; log so a silent fallback is
      // diagnosable in the field.
      console.warn('BeamCanvas disabled:', err)
      canvas.style.display = 'none'
      return
    }
    gl.useProgram(prog)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE) // light adds over the dark page

    const u = (name: string) => gl.getUniformLocation(prog, name)
    const colors = JOBS.map((j) => hexToRgb(j.palette.accent))

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(devicePixelRatio || 1, 2)

    // Displayed weights ease toward targets so a lock collapses the light
    // smoothly instead of snapping.
    const shown = [...targets.current.weights]
    let lightShown = document.documentElement.dataset.theme === 'light' ? 1 : 0
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX / innerWidth
      pointer.ty = e.clientY / innerHeight
    }
    if (!reduced) addEventListener('pointermove', onMove, { passive: true })

    let raf = 0
    let running = true
    const t0 = performance.now()

    const draw = () => {
      const { geom: g, weights: tw } = targets.current
      const w = Math.round(g.width * dpr)
      const h = Math.round(g.height * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      for (let k = 0; k < 4; k++) shown[k] += (tw[k] - shown[k]) * (reduced ? 1 : 0.08)
      const lightTarget = document.documentElement.dataset.theme === 'light' ? 1 : 0
      lightShown += (lightTarget - lightShown) * (reduced ? 1 : 0.1)
      pointer.x += (pointer.tx - pointer.x) * 0.06
      pointer.y += (pointer.ty - pointer.y) * 0.06

      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(u('uSize'), g.width, g.height)
      gl.uniform1f(u('uDpr'), dpr)
      gl.uniform1f(u('uTime'), reduced ? 0 : (performance.now() - t0) / 1000)
      gl.uniform2f(u('uPointer'), pointer.x, pointer.y)
      gl.uniform2f(u('uEntryA'), g.entry.x1, g.entry.y1)
      gl.uniform2f(u('uEntryB'), g.entry.x2, g.entry.y2)
      gl.uniform2f(u('uOrigin'), g.exits[0]?.x1 ?? 0, g.exits[0]?.y1 ?? 0)
      for (let k = 0; k < 4; k++) {
        const e = g.exits[k]
        gl.uniform2f(u(`uExit[${k}]`), e?.x2 ?? 0, e?.y2 ?? 0)
        gl.uniform3f(u(`uColor[${k}]`), ...colors[k])
        gl.uniform1f(u(`uWeight[${k}]`), shown[k])
      }
      gl.uniform1f(u('uWhite'), 0.9)
      gl.uniform1f(u('uLightMode'), lightShown)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    if (reduced) {
      draw() // one formed frame, no loop
    } else {
      const loop = () => {
        if (running) draw()
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

    // Don't burn GPU while the hero is off-screen.
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting
    })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      removeEventListener('pointermove', onMove)
      // Deliberately NOT losing the GL context: StrictMode remounts reuse
      // the same canvas, and a lost context can't compile shaders again.
    }
  }, [])

  return <canvas ref={canvasRef} className="beam-canvas" aria-hidden="true" />
}
