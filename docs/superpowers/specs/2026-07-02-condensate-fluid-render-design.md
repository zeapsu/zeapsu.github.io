# Condensate fluid render — design

Date: 2026-07-02. Covers issues #6 (condensate textures + palette) and #4 (OG image).
Supersedes the "flat neon glow" terrain direction in
`2026-07-02-portfolio-3d-journey-design.md` (MVP step 5); everything else in that
spec stands.

## Problem

The GPE terrain shipped with placeholder rendering: an unlit `meshBasicMaterial`
with per-vertex colors rewritten on the CPU every frame (32k vertices), in light
cyan `#7dd6ff` / pink `#ff94d2`. It reads flat and toy-like. Target: a
hyperrealistic fluid — dark glassy surface where light glances off wave crests —
with a palette that stays physically legible (spin-up vs spin-down vs domain
walls).

Physics is out of scope. Measured sim cost is 0.1 ms/frame (6 steps, N=256);
the render path is the bottleneck and this design removes it.

## Palette: abyssal

Deep water with bioluminescence. Warm/cold is the strongest perceptual spin
distinction and holds up against the #1 text-contrast scrims.

- Base / domain walls: `#050a14` near-black indigo (spin ≈ 0 falls to black
  glass fault lines)
- Spin-up ramp: `#1e6f8f` deep teal → `#4fd8c8` cold cyan crest
- Spin-down ramp: `#7a4a1e` bronze → `#f0a848` amber crest
- DOM accents (`--spin-up`/`--spin-down` in `index.css`) move to the crest
  colors so the rail gradient and UI stay coherent with the terrain.

## Render architecture

`ShaderMaterial` fed by a `DataTexture`, replacing all per-frame CPU geometry
work:

- **Data**: the existing M=128 × N=256 spin history ring buffer uploads as a
  RedFormat/FloatType/NearestFilter DataTexture (~128 KB every 3rd frame). Ring
  head is a uniform; the shader maps mesh row → history row.
- **Vertex**: static plane (30×46, 256×128). Sample spin at the vertex texel →
  displace Y. Sample 4 neighbors → smooth analytic normal.
- **Fragment**: sign-of-spin picks the ramp, |spin| the ramp position;
  Blinn-Phong specular from a fixed cold key light (the water read); fresnel rim
  against the void; existing 0.55 age fade; scene fog.
- **Frozen path** (reduced motion): pre-step 3000, fill history once, upload the
  texture once, never update. No time dependency in the surface shader, so the
  frozen frame stays deterministic for screenshot verification.

## Bloom

`@react-three/postprocessing` selective bloom so only crests glow. Threshold
tuned to keep hero text legible over the terrain. The composer is skipped
entirely on mobile (coarse pointer / small viewport) and on software renderers
(SwiftShader/llvmpipe via `WEBGL_debug_renderer_info`) — those get the plain
shader, which must look complete on its own.

## OG image (#4)

After visuals verify: reduced-motion hero frame via Playwright, cropped to
1200×630 at `public/og.png`, `og:` + `twitter:` meta in `index.html`.

## Verification

- `npm run build` clean; `node src/sim/gpe.selfcheck.ts` passes (sim untouched).
- Playwright with `prefers-reduced-motion: reduce` (deterministic brightest
  terrain) at several scroll offsets; 390 px mobile with bloom confirmed off;
  live-motion smoke pass; no-WebGL fallback innerText check; text contrast over
  the new terrain.

## Rejected

- numpy-ts for the sim: plain-JS ndarray overhead on top of an already
  hand-rolled typed-array FFT; sim is 0.6% of frame budget.
- Python component: static Pages site has nowhere to run it; Pyodide is ~10 MB
  to replace 0.1 ms of JS; precomputed frames would break the "live simulation"
  honesty guardrail.
- Lit standard material without a shader: CPU normals per frame cost more than
  today and cap out at plastic, not fluid.
