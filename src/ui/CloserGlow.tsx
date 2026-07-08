import { useEffect, useRef, useState } from 'react'
import { JOBS, type JobId } from '../content/jobs'

// The hero's bookend: where the prism split one identity into four beams,
// the closing sheet gathers them back. A small WebGL2 quad renders the four
// facet hues converging into a soft white core beside the contact block.
// Fork of the BeamCanvas idiom (not shared: that shader is hero-bound to
// measured DOM geometry); decorative only, aria-hidden, SVG twin without
// WebGL2, one formed frame under reduced motion.

const VERT = `#version 300 es
void main() {
  // fullscreen triangle
  vec2 v = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(v * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uSize;       // canvas size in CSS px
uniform float uDpr;
uniform float uTime;
uniform vec3 uColor[4];
uniform float uWeight[4];
uniform float uLightMode; // 0 = additive over dark, 1 = painted on paper
uniform vec3 uPaper;      // the sheet's ground

// where the four wavelengths meet again
const vec2 CORE = vec2(0.58, 0.50);

float segDist(vec2 p, vec2 a, vec2 b, out float t) {
  vec2 pa = p - a, ba = b - a;
  t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
  return length(pa - ba * t);
}

// Additive glow around a segment: tight core + wide halo, igniting near the
// source and BRIGHTENING toward the end (the hero decays away from the
// prism; here the light gathers, so it grows toward the core).
float beam(vec2 p, vec2 a, vec2 b, float core, float halo) {
  float t;
  float d = segDist(p, a, b, t);
  float fall = smoothstep(0.0, 0.14, t) * (0.55 + 0.45 * t);
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
  vec2 p = vec2(gl_FragCoord.x / uDpr, uSize.y - gl_FragCoord.y / uDpr);
  vec2 corePx = CORE * uSize;

  // the four beams arrive from the page's side (left/top/bottom edges)
  vec2 entry0 = vec2(0.02, 0.08) * uSize;
  vec2 entry1 = vec2(0.00, 0.40) * uSize;
  vec2 entry2 = vec2(0.04, 0.74) * uSize;
  vec2 entry3 = vec2(0.34, 1.00) * uSize;

  vec3 col = vec3(0.0);     // additive light (dark ground)
  vec3 absorb = vec3(0.0);  // pigment shadow (paper ground)
  vec3 shine = vec3(0.0);   // light painted OVER the paper
  float field = 0.0;

  // tighter falloffs than the hero: on a small square a wide halo lifts the
  // whole quad and prints its edge against the sheet
  vec2 entries[4] = vec2[4](entry0, entry1, entry2, entry3);
  for (int i = 0; i < 4; i++) {
    float w = uWeight[i] * (0.94 + 0.06 * sin(uTime * 1.7 + float(i) * 2.1));
    float b = beam(p, entries[i], corePx, 0.06, 0.016) * w;
    col += uColor[i] * b * 1.5;
    absorb += (vec3(1.0) - uColor[i]) * b * 0.9;
    field += b;
  }

  // recombination: the four hues sum toward white at the core, plus an
  // explicit quiet white glow (the hero's burst, gathering instead)
  float dB = length(p - corePx);
  float B = exp(-dB * 0.030);
  col += vec3(0.95) * B * 0.85;
  shine += vec3(1.0) * B * 1.05;
  field += B;

  // dust sparkles INSIDE the light only: gate on the field so the motes
  // never print the canvas bounds on the sheet
  float motes = dust(p, uTime, 26.0, vec2(6.0, 1.8)) + dust(p, uTime, 47.0, vec2(-3.5, 2.6));
  float dustI = motes * min(max(field - 0.05, 0.0) * 2.2, 1.0);
  col += vec3(0.95) * dustI * 0.9;
  shine += vec3(1.0) * dustI * 0.8;

  // this canvas is an island inside the sheet: a radial vignette around the
  // core (not a per-edge fade) keeps the glow circular, so the beams fade in
  // from the sheet and the quad's bounds never print as a square
  float E = uSize.x * 0.09;
  float edge = smoothstep(0.0, E, p.x) * smoothstep(uSize.x, uSize.x - E, p.x) *
               smoothstep(0.0, E, p.y) * smoothstep(uSize.y, uSize.y - E, p.y);
  edge *= 1.0 - smoothstep(0.38, 0.60, length(p - corePx) / uSize.x);
  col *= edge;
  absorb *= edge;
  shine *= edge;

  // fine grain dithers the halo tails, but only where light exists: the
  // sheet outside has no grain, so an all-over film would draw the square
  float g = (hash(gl_FragCoord.xy + fract(uTime)) - 0.5);
  float lit = min(field * 2.0, 1.0) * edge;
  col += g * mix(0.02, 0.006, min(field, 1.0)) * lit;

  // Dark: light adds over the ground. Light: pigment + shine on paper.
  vec3 night = max(uPaper + col, 0.0);
  vec3 paper = clamp(uPaper - min(absorb, vec3(0.5)) + shine, 0.0, 1.0) + g * 0.014 * lit;
  outColor = vec4(mix(night, paper, uLightMode), 1.0);
}`

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const REDUCED =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

const supportsWebGL2 = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

// Static twin for the no-WebGL2 tier: the same four beams and white core.
function GlowSvg() {
  return (
    <svg className="closer-glow-svg" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="closer-core">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {JOBS.map((j, i) => {
        const entries = [
          [4, 16],
          [0, 80],
          [8, 148],
          [68, 200],
        ]
        return (
          <line
            key={j.id}
            x1={entries[i][0]}
            y1={entries[i][1]}
            x2={116}
            y2={100}
            stroke={j.palette.accent}
            strokeWidth="2"
            strokeLinecap="round"
          />
        )
      })}
      <circle cx="116" cy="100" r="34" fill="url(#closer-core)" />
    </svg>
  )
}

export function CloserGlow({ lens }: { lens: JobId | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // A lost GL context can't compile shaders again; remount the canvas via key.
  const [epoch, setEpoch] = useState(0)
  const [gl2] = useState(supportsWebGL2)
  const targets = useRef({ lens })
  targets.current = { lens }
  const drawRef = useRef<(() => void) | null>(null)
  useEffect(() => {
    if (REDUCED) drawRef.current?.()
  }, [lens])

  useEffect(() => {
    if (!gl2) return
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false })
    if (!gl) return

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
      console.warn('CloserGlow disabled:', err)
      canvas.style.display = 'none'
      return
    }
    gl.useProgram(prog)

    const u = (name: string) => gl.getUniformLocation(prog, name)
    const colors = JOBS.map((j) => hexToRgb(j.palette.accent))
    // The ground is the SHEET, not the page: the closer carries data-theme
    // and its background transitions ~700ms on the lights toggle. Read per
    // frame, cached on the string.
    const panel = canvas.closest('[data-theme]') as HTMLElement | null
    let bgStr = ''
    let paper: [number, number, number] = [0.85, 0.82, 0.76]
    const readPaper = () => {
      if (!panel) return
      const s = getComputedStyle(panel).backgroundColor
      if (s === bgStr) return
      bgStr = s
      const m = s.match(/\d+(\.\d+)?/g)
      if (m && m.length >= 3 && m[3] !== '0') {
        paper = [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255]
      }
    }

    const reduced = REDUCED
    const shown = [1, 1, 1, 1]
    let lightShown = panel?.dataset.theme === 'light' ? 1 : 0

    let raf = 0
    let running = true
    const t0 = performance.now()

    const draw = () => {
      const size = canvas.clientWidth
      if (size === 0) return
      const dpr = Math.min(devicePixelRatio || 1, 2)
      const wh = Math.round(size * dpr)
      if (canvas.width !== wh || canvas.height !== wh) {
        canvas.width = wh
        canvas.height = wh
        gl.viewport(0, 0, wh, wh)
      }
      const lensIdx = targets.current.lens
        ? JOBS.findIndex((j) => j.id === targets.current.lens)
        : -1
      for (let k = 0; k < 4; k++) {
        const tw = lensIdx === -1 || lensIdx === k ? 1.0 : 0.75
        shown[k] += (tw - shown[k]) * (reduced ? 1 : 0.08)
      }
      const lightTarget = panel?.dataset.theme === 'light' ? 1 : 0
      lightShown += (lightTarget - lightShown) * (reduced ? 1 : 0.1)

      gl.uniform2f(u('uSize'), size, size)
      gl.uniform1f(u('uDpr'), dpr)
      gl.uniform1f(u('uTime'), reduced ? 0 : (performance.now() - t0) / 1000)
      for (let k = 0; k < 4; k++) {
        gl.uniform3f(u(`uColor[${k}]`), ...colors[k])
        gl.uniform1f(u(`uWeight[${k}]`), shown[k])
      }
      gl.uniform1f(u('uLightMode'), lightShown)
      readPaper()
      gl.uniform3f(u('uPaper'), paper[0], paper[1], paper[2])
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    drawRef.current = draw

    let settle: ReturnType<typeof setTimeout> | undefined
    let themeMo: MutationObserver | undefined
    if (reduced) {
      draw() // one formed frame, no loop...
      settle = setTimeout(draw, 900) // ...re-drawn once the bg transition lands
      if (panel) {
        themeMo = new MutationObserver(() => {
          draw()
          clearTimeout(settle)
          settle = setTimeout(draw, 900)
        })
        themeMo.observe(panel, { attributes: true, attributeFilter: ['data-theme'] })
      }
    } else {
      const loop = () => {
        if (running) draw()
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

    // GPU gate: own visibility only. Unlike BeamCanvas/SkillField there is no
    // "next sheet covers me" observer — this is the last sheet, nothing slides
    // over it, and scrolling up un-pins it so plain intersection suffices.
    // Once pinned at page end it keeps rendering; the user is looking at it
    // and the fill cost is a ~420px square.
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting
    })
    io.observe(canvas)

    const onLost = (e: Event) => {
      e.preventDefault()
      setTimeout(() => setEpoch((n) => n + 1), 0)
    }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      drawRef.current = null
      cancelAnimationFrame(raf)
      clearTimeout(settle)
      themeMo?.disconnect()
      io.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
    }
  }, [gl2, epoch])

  if (!gl2) return <GlowSvg />
  return <canvas key={epoch} ref={canvasRef} aria-hidden="true" />
}
