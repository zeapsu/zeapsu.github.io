# Project stations (issue #2, projects scope)

Date: 2026-07-02
Status: approved

## Problem

Issue #2 asks for per-scene staged 3D elements in the galaxy-portfolio style. The
original journey spec planned "5 floating project stations" for the projects
stretch and deferred them; today the camera glides through empty air from scroll
0.4 to 0.78 while the project cards scroll past.

## Reference study

galaxy-portfolio (vendored on the Jetson) is discrete scene-swapping: a zustand
SceneManager plus gsap zoom transitions between self-contained environments,
each with its own lights and backdrop. What transfers to a continuous scroll
journey is the staging idea — self-contained, visibility-gated set-piece groups —
not the architecture. Scene swapping, gsap, and an asset manager buy nothing here.

## Decisions

1. **Terrain persists; set pieces are added along the journey.** The live GPE sim
   is the site's stated centerpiece (the hero caption says so). Fading it out per
   scene would demote it and cost a transition system.
2. **Scope: the 5 project stations only.** Research already has the terrain as
   its set piece; a contact closer is deferred.

## Design

One component, `src/three/ProjectStations.tsx`, mounted in `App.tsx` with
`frozen={reducedMotion}`. No new dependencies, no new drei imports, no config.

- **Station** = wireframe icosahedron shell (r 0.9, detail 1) + small solid core
  (r 0.16) + thin tilted torus ring (r 1.2, tube 0.012). All `MeshBasicMaterial`
  (the scene has no lights). Teal `#4fd8c8` / amber `#f0a848` alternating by
  index; wires and idle cores dimmed x0.55 to stay under the Bloom luminance
  threshold (0.72).
- **Placement**: station i at `x = (i%2 ? -1 : 1) * (mobileLayout ? 2.1 : 4)`
  (opposite the DOM card's side), `y ~ 2.2` (clears terrain crest y=0.4),
  `z = -3 - 2.5*i`. Focal scroll offset derived from layout constants:
  `FOCUS[i] = (CARD_BASE + i*CARD_STEP - 25) / ((PAGES - 1) * 100)`.
- **Scroll-window visibility** (required — hero and closing cameras stare down
  the station corridor otherwise): `s = 1 - smoothstep(|offset - FOCUS[i]|,
  HALF*0.5, HALF)`, `HALF = mobileLayout ? 0.11 : 0.15`, driving group scale and
  `visible`. Runs even when frozen, same rule as the camera following scroll
  under reduced motion.
- **Active lift**: core color = base x (0.55 + 0.85 s^2). Only the focused
  station's core crosses the bloom threshold, so exactly one halo on desktop;
  plain brightening on mobile where bloom is off.
- **Motion**: when not frozen, slow alternating rotation (0.15 rad/s) and a
  0.12-amplitude bob. Frozen: deterministic static pose, screenshot-stable.

## Performance budget

At most 15 opaque low-poly draw calls, only while inside the projects scroll
window; zero transparency or overdraw; no bundle delta (core three.js
geometries). Expected FPS delta ~0 against the 96 fps retina baseline, verified
at deviceScaleFactor 2. If it regresses, torus segments are cut first.

## Verification

Build clean + sim selfcheck, then on this MacBook via Playwright MCP:
reduced-motion screenshots at hero / research / each FOCUS[i] / closing
(stations absent outside their windows, crisp at their card, never over the
card text side), a live-motion feel pass, FPS A/B at dsf 2, mobile 390x844
(dsf 3), short-desktop 1280x700 spot check, no-WebGL fallback untouched.
