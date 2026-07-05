# Dimensionality + entry experience — design spec (#21, #22, #23)

Date: 2026-07-05
Status: approved direction (xhigh design session) — spec only, no implementation yet.
Implementation is a later session at effort **high** with `/design-taste-frontend`,
sequenced across **two PRs**. #27 (reset shutdown / TV-off) stays a separate follow-up.

Builds on the shipped character-select redesign
(`docs/superpowers/specs/2026-07-02-character-select-redesign-design.md`, live since
PR #18). That spec's conceit, floors, and four-world roster are assumed here.

## Context (why this change)

The live site reads flat (#21): the gate is a 2D crossfading portrait `<img>` over a
fixed backdrop, and each equipped world is a fixed camera framing with a faint idle
sway — a backdrop, not a place you move through. Two coupled weaknesses sit on the
same surface: the start screen **and** the gate both mount the Physicist frozen-deep
world, so the entry pre-commits to one job before the visitor chooses anything (#22);
and the chat terminal overlaps the centered content panels across the mobile→~1920px
width range (#23).

The direction (2026-07-05 brainstorm) is to add a genuine third axis. The entry
becomes an MMO/anime-native dive-and-spawn into a neutral fantasy character-select
realm; the gate carousel becomes truly volumetric; each equipped world's camera
travels as you read. Reference language: Sword Art Online "Link Start" (the dive),
Genshin Impact (the vista's craft, not its IP), FFXIV/GW2 (the dais + roster, already
the site's conceit). Intended outcome: the site feels three-dimensional and showcases
each world, without breaking any floor.

Bundle rationale (the recorded sequencing heuristic): #22 and #23 live on the exact
surface #21 rebuilds, so they fold in; #27 is independent and stays separate.

## The three floors (unchanged — they gate every decision)

- **60 fps @ deviceScaleFactor 2** on the MacBook (retina 2880×1800), measured per
  AGENTS.md machine notes (fresh `newContext({deviceScaleFactor:2})` per scene).
- **prefers-reduced-motion:** no dive, no breeze/idle, no camera travel — a static
  formed frame; themes still switch.
- **no-WebGL + `?plain=1`:** the DOM gate carries all function; `?plain=1` carries all
  content ungated (SEO/crawl path).
- **Real DOM text everywhere (never texture-baked), visible focus states.**

---

## A. Entry experience — PR 1

Flow: **black start → SAO "Link Start" dive → spawn → fantasy character-select vista.**

1. **Start screen — black + prompt.** Strip today's frozen-deep window start down to
   near-black with a single "press any key" prompt (real DOM text; keyboard/click/touch
   all advance). Maximum TLOU restraint — the first frame commits to nothing and keeps
   the recruiter-facing first impression calm.

2. **Dive — faithful SAO "Link Start" homage.** On any input, a full-screen dive
   cinematic: the "LINK START" beat, a rainbow light-stream tunnel accelerating toward
   the viewer, a brief system-boot / senses-coming-online cadence, resolving into the
   spawn. ~2–3 s. **Any input skips** to spawn. Under reduced-motion it is not played at
   all (straight to the formed vista). Scoped to the entry transition only — it does NOT
   touch the chat terminal, which stays an **honest shell** (no cosplay theatrics there;
   the two are deliberately kept separate). Implementation: a transient full-screen
   effect (WebGL shader tunnel or 2D-canvas/CSS — cheapest that hits the look),
   unmounted after spawn so it costs nothing during the gate.
   - Kitsch mitigations for the recruiter audience (a conscious craft choice): the black
     restrained first frame, elegant glass panels, literal job names on the cards, and
     the one-click plain-text hatch all remain.

3. **Spawn choreography.** The vista forms; the **name ("Andry Paez") fades in first**
   (~0.8 s), then the **four portraits form into the carousel** (staggered ~0.6 s).
   Reduced-motion: both appear statically.

4. **Fantasy character-select vista — the neutral hub.** A **fixed cinematic vista**,
   Genshin-craft-inspired but its own place (not Genshin IP): one beautifully composed
   fantasy landscape with the four portrait cards on a **dais** in the foreground
   (FFXIV dais read). **Ambient life only** — a gentle breeze swaying trees/foliage — no
   camera travel here (the camera lives in one composed spot, at most a faint parallax
   drift). **Pure neutral fantasy landscape**: no you-specific or job-specific motifs, so
   it pre-commits to nothing. This is the honest resolution of #22 — a distinct realm,
   not the physics world with the lights down.
   - **Metaphor rule:** passes because the MMO-character-select conceit is itself the
     site's true frame — this is the character-select *stage*, native staging of the
     whole conceit, not decorative cosplay. Built as "Andry's character-select realm,"
     Genshin as a craft reference only.
   - **Pipeline:** Blender-authored + **baked lighting** + optimized stylized geometry,
     exported as glTF, loaded in R3F (this is where the spec amendment's blessed Blender
     MCP use earns its place). Perf budget below.

5. **Volumetric carousel (the #21 gate half).** The four painted portraits become
   textured planes on the dais on a shallow arc: the previewed job's plane sits forward
   and centered with a **subtle idle float + parallax sway**; the others angle back,
   smaller and dimmer, each carrying its own job-palette rim. Previewing rotates the arc
   to bring that plane forward (damped `useFrame`; drei/maath easing — no new dep).
   Portraits render **unlit** (finished painted art; re-lighting would look wrong) — the
   dais and vista carry the light so the planes read as *embedded*, not UI over a
   backdrop.
   - **All text stays flat DOM** (floor forbids texture-baked text): the centered
     nameplate + selected tagline, and each card's job name / subtitle / level pips, are
     DOM. **Only the portrait art is volumetric.** This is the honest reading of #21 —
     "the character card is not an exception" = the portrait tile goes 3D; "name +
     description stays flat" = all copy stays DOM.
   - **DOM interface layer (accessibility spine):** the four `<button>`s survive as the
     real focusable controls — a compact control row (name, subtitle, pips, "last
     played", focus ring) beneath the carousel. Hover/focus → preview (rotate plane
     forward + the existing preview re-light); click/Enter → equip. Keyboard + screen
     readers are unaffected because the interface was never the 3D layer.

6. **Equip — collapse the hub.** Selecting a job transitions the neutral vista into that
   job's world (a brief collapse/flash echoing the dive's light, or the existing
   `equip-out`; reduced-motion instant). The four job worlds are unchanged scenes.

7. **Fallbacks.**
   - **no-WebGL:** no vista, no dive; the gate falls to the DOM — nameplate + today's
     portrait-`<img>` crossfade stack (**kept as the WebGL-absent fallback**) + the DOM
     control row, over the themed gradient. `?plain=1` unchanged.
   - **reduced-motion + WebGL:** the vista renders as a static formed frame, carousel
     frozen (previewed plane forward, no float/rotate), no breeze.

8. **Mobile (the #21-mandated separate solution).** Phones show **one portrait plane
   centered and large** (the selected job) with a **horizontal swipe/tap DOM job row**
   beneath; swiping/tapping rotates selection. The vista renders (dpr capped 1.5, bloom
   off per `quality.ts`) with a reduced motion budget (lighter breeze, no dais bloom).

## B. Equipped-world scroll-driven camera — PR 2 (the #21 world half)

`CameraRig` grows from a single fixed framing to a **per-world spline of 3–5 waypoints**,
sampled by **normalized document scroll progress read inside `useFrame`** (rAF sample —
NOT a `scroll` event listener; respects the perf ban). As the visitor scrolls the glass
panels (About → Quest log → Quest board → Skill tree → Achievements → Contact), the
camera pans/orbits through each world, showcasing different regions as you read. A faint
idle drift is retained for life-when-still.
- Two hard constraints inherited from today's framings: every waypoint keeps a **darker
  region behind the centered panels** (legibility over the bright worlds), and the path
  stays gentle (no lurching behind text).
- Reduced-motion pins to one formed framing (as today). Mobile tones down to a short
  waypoint travel or just idle drift (motion/battery budget).
- Waypoints are per-world tuning constants, same family as the existing
  `EQUIPPED_FRAMING` in `WorldCanvas.tsx`.

## C. Terminal overlap — PR 2 (#23)

Contained CSS/layout fix: the terminal becomes **gutter-aware**. It floats bottom-left
only while the left margin can host a usable width (its width tracks the gutter, capped
at 30rem); below that threshold it **docks to a collapsed bottom bar** (the existing
mobile treatment, raised to apply across the mid-width range) that the user opens
deliberately. Its right edge never crosses the 62rem centered panel column. Pure CSS;
reduced-motion / no-WebGL untouched. (#24's robotics hardware panel inherits the fix.)
- Geometry: panel column max-width 62rem; terminal up to 30rem at left ~1.75rem → a
  30rem float only clears the centered column above ~124rem (~1984px), exactly the
  reported "fine above ~1920, broken below" boundary.

---

## Perf budget (the gating risk — the fantasy vista)

A Genshin-craft vista is far heavier than today's abstract worlds; 60fps@dsf2 holds only
if designed to the budget from the start:
- **Fixed cinematic vista** (one composed location), not an explorable/orbitable world.
- **Baked lighting** (no realtime shadow maps), authored in Blender, exported to glTF.
- Draw-call discipline: **instanced foliage/trees**, imposters/LOD for distant elements,
  a capped material/texture set.
- Reuse `quality.ts` gates: dpr cap (1.5 coarse / 2), bloom off on mobile + software
  rasterizer, MSAA only at dpr<1.5.
- The four textured carousel quads + the dais are cheap; the **vista geometry** is the
  cost to watch.
- Profile per AGENTS.md: fresh `newContext({deviceScaleFactor:2})` per scene, dsf1
  aliasing crop, 390px check. Build the look, then optimize to the floor.

## Critical files (indicative)

**PR 1 (entry):**
- `src/three/GateCarousel.tsx` (new) — portrait planes + dais + idle/preview.
- new entry-vista component + Blender glTF asset + loader.
- `src/three/WorldCanvas.tsx` — entry vista serves stages `start`/`select` instead of the
  frozen deep; mount carousel; #22 resolved by the vista itself (frozen deep becomes the
  Physicist-only world).
- dive component (e.g. `src/ui/Dive.tsx`) + a `dive` phase in `src/App.tsx`.
- `src/ui/StartScreen.tsx` — black + prompt.
- `src/ui/CharacterSelect.tsx` — nameplate/tagline stay; `<img>` stack → no-WebGL
  fallback only; cards → DOM control row; wire preview/equip.
- `src/index.css` — control row, fallback/visibility rules, reduced-motion gates.

**PR 2 (cameras + #23):**
- `src/three/WorldCanvas.tsx` — scroll-spline `CameraRig` + per-world waypoints.
- `src/App.tsx` — scroll-progress source if needed.
- `src/index.css` — #23 gutter fix.

No sim change (honest-physics untouched), no content invention, **no new runtime
dependency** (Blender is authoring-time; glTF loads via `three`/`drei` already present).
Any new/edited copy follows the house rule (no em dashes, Andry's voice, traceable to
experience.md).

## Verification (end-to-end)

- `npm run build` clean; `node src/content/jobs.selfcheck.ts` + `node
  src/sim/gpe.selfcheck.ts` pass.
- Drive the real page: black start → dive (and skip) → spawn (name then carousel) →
  preview each job (plane rotates + world re-lights) → equip → scroll each world (camera
  travels, panels stay legible) → reset. Screenshot per world at dsf2; dsf1 aliasing crop.
- **60fps@dsf2** on the vista (carousel live) and on each equipped world with the camera
  moving; fresh `newContext` per scene.
- reduced-motion: dive skipped, computed transitions `none`, static formed frames.
- no-WebGL: DOM gate + `?plain=1` carry everything. 390px: no horizontal scroll; mobile
  swipe carousel + toned camera.
- Aesthetic sign-off (vista + gate + each world) is Andry's, from real screenshots/live
  driving.

## Rejected / superseded

- **CSS-3D coverflow carousel** — rejected for true R3F volumetric (Andry wants real
  depth on the dais).
- **Neutralizing/blending the frozen-deep aurora for #22** — rejected: the aurora IS the
  Physicist's world, so any version still reads as physics. Replaced by a distinct
  neutral fantasy realm.
- **Superposition / cosmos / drifting-motes** entry concepts — superseded by the SAO-dive
  + Genshin-vista flow.
- **Framer Motion / `motion`** — not added: the load-bearing motion is inside R3F (Motion
  can't drive Three; `framer-motion-3d` is discontinued), and the DOM motion is simple
  enough for CSS. Would only earn its place for rich DOM panel choreography, out of #21's
  scope. Spring feel on 3D, if wanted, is `@react-spring/three` or drei/maath easing.

## Open (implementation-phase) decisions

- Exact dive implementation (WebGL shader tunnel vs 2D-canvas/CSS) — cheapest that hits
  the look.
- Vista composition specifics (landscape, palette, dais placement) — authored/iterated in
  Blender next session, judged against the AAA bar from real screenshots.
- Equip-collapse transition exact treatment.
- Per-world camera waypoint paths (tuning).
