# Dispersion Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the flat portfolio around the dispersion concept — white light through the portrait-as-prism, four wavelength beams as the facet filter, the active wavelength carried down the page — per `docs/superpowers/specs/2026-07-07-dispersion-redesign-design.md`.

**Architecture:** Three visual layers. Layer 0: DOM (photo, headline, beam-end buttons, all content — always). Layer 1: static SVG beams whose geometry is measured from the real DOM positions (ResizeObserver), serving as the reduced-motion state and no-WebGL fallback. Layer 2: a single WebGL2 fragment-shader quad behind the hero DOM adding volumetric light, dust, and shimmer, driven by the same measured geometry and the lens state. Below the hero, a scroll-drawn light spine and "catch the light" heading reveals.

**Tech Stack:** Vite + TypeScript + React (existing). Raw WebGL2, no new runtime dependencies. CSS scroll-driven animations with IO fallback (existing `reveal.ts` pattern).

## Global Constraints

- All copy stays traceable to `~/Documents/personal/experience.md`; no new claims. New strings limited to structural labels (eyebrows, the `dispersion` caption, link text).
- Palette hexes live only in `src/content/jobs.ts` + the four `:root[data-job]` CSS blocks; `node src/content/jobs.selfcheck.ts` must pass after every task.
- `npm run build` clean after every task.
- Accessibility floors: real DOM text, `prefers-reduced-motion` gets a fully formed static composition, `?plain=1` renders all content as innerText, visible focus states on all controls.
- Perf floor: 60 fps at deviceScaleFactor 2 on the MacBook, hero in view.
- Verification is Playwright-MCP-driven on the MacBook. Headless defaults to reduced-motion: use `page.emulateMedia({ reducedMotion: 'no-preference' })` to see motion. Dev server: `npm run dev -- --port 5199`.
- Commit per task, present-imperative subject, body explains why + verification evidence.

## File Structure

- `src/content/data.ts` — modify: research section reframed as NOW (+ structured pull-stat), quest-log RA entry deduplicated, about/contact copy merge points.
- `src/content/jobs.ts` — unchanged (palette + ids are already right).
- `src/ui/Hero.tsx` — rewrite: prism hero (photo-as-prism, SVG beams, beam-end filter buttons, rotator synced to brightest beam).
- `src/ui/dispersion.ts` — create: `useBeamGeometry` hook — measures container/photo/button rects, returns entry + exit beam segments. Single source of truth consumed by both the SVG and the shader.
- `src/ui/BeamCanvas.tsx` — create: WebGL2 shader layer (GLSL inline, one file).
- `src/ui/Panels.tsx` — modify: new section order NOW → WORK → PATH → RECOGNITION → ABOUT+CONTACT; pull-stat; wavelength ticks.
- `src/ui/Sections.tsx` — modify: `ProjectCard` gains facet ticks + hardware figures fold into reachy-console; `StaticFallback` reordered to match.
- `src/ui/reveal.ts` — modify: also tag headings for the light-sweep class.
- `src/index.css` — major rework: hero layout, static beam styles, spine, catch-the-light, pull-stat display type, mobile 390, reduced-motion blocks.
- `src/App.tsx` — minor: unchanged state model (locked/preview/lens/accent), keeps `?plain=1` gate.

---

### Task 1: Section IA restructure (no new visuals yet)

**Files:**
- Modify: `src/content/data.ts`
- Modify: `src/ui/Panels.tsx`
- Modify: `src/ui/Sections.tsx`

**Interfaces:**
- Produces: `research.pullStat: { value: string; label: string }`; `ProjectCard` prop `tags: JobId[]`; `JOB_TAGS` exported from `Panels.tsx`; `HardwareFigures` rendered inside the reachy-console card only.

- [ ] **Step 1: data.ts — reframe NOW, dedupe the timeline, add the pull-stat**

In `src/content/data.ts`:

```ts
export const research = {
  eyebrow: 'now',
  title: 'Simulating ultracold atoms at San Jose State',
  body: /* unchanged */,
  // Display-type pull-stat; the same fact stays in `facts` in full.
  pullStat: {
    value: '1,880×',
    label: 'sine-DVR kinetic-energy operator, 161 s → 0.09 s, verified bit-exact',
  },
  facts: [ /* unchanged five facts */ ],
}
```

Quest log: title becomes `'Experience'`; intro becomes
`'The route here was not a straight line: community college to a physics degree to a research lab.'`
The active RA entry's detail becomes the one-liner
`'Spinor Bose-Einstein condensate simulations with Dr. Hilary Hurst — the work in Now, above.'`
(no facts duplicated).

- [ ] **Step 2: Panels.tsx — reorder sections and merge about into contact**

New order inside `<main className="panels">`: NOW (research) → WORK (projects) → PATH (quest log) → RECOGNITION (achievements) → CONTACT+ABOUT. The `howIWork` section stops being standalone: render its body paragraph inside the contact section under a `p.about-line`, and move the skills grid into the same section above the resume button. Delete the standalone hardware section (folds into the reachy card in Step 3). Render the pull-stat in NOW:

```tsx
<p className="pull-stat" aria-hidden="true">
  <span className="pull-stat-value">{research.pullStat.value}</span>
  <span className="pull-stat-label">{research.pullStat.label}</span>
</p>
```

(`aria-hidden` because the identical fact is read out in the facts list.)

- [ ] **Step 3: Sections.tsx — ProjectCard ticks + hardware fold + StaticFallback order**

`ProjectCard` signature becomes `{ p, featured, tags }: { p: Project; featured: boolean; tags: JobId[] }`. Render ticks in the card header (palette read from `JOBS`):

```tsx
<span className="facet-ticks" aria-hidden="true">
  {tags.map((t) => (
    <i key={t} style={{ background: JOBS.find((j) => j.id === t)!.palette.accent }} />
  ))}
</span>
```

When `p.name === 'reachy-console'`, render `<HardwareFigures />` at the card's foot (compact variant, same figures/captions). Reorder `StaticFallback` sections to NOW → WORK → PATH → RECOGNITION → CONTACT+ABOUT so `?plain=1` matches.

- [ ] **Step 4: Build + selfcheck + drive**

Run: `npm run build && node src/content/jobs.selfcheck.ts` — expect clean.
Drive `http://localhost:5199/` and `/?plain=1`: section order NOW/WORK/PATH/RECOGNITION/CONTACT, RA timeline entry is the one-liner, hardware photos inside the reachy card, no orphan sections.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Restructure sections: NOW leads, path dedupes, hardware folds into work"
```

---

### Task 2: Prism hero — static composition (Layer 0 + Layer 1)

**Files:**
- Create: `src/ui/dispersion.ts`
- Rewrite: `src/ui/Hero.tsx`
- Modify: `src/index.css` (hero block)

**Interfaces:**
- Produces: `useBeamGeometry(heroRef, photoRef, buttonRefs): BeamGeometry | null` where
  `type Segment = { x1: number; y1: number; x2: number; y2: number }` and
  `type BeamGeometry = { entry: Segment; exits: Segment[]; width: number; height: number }`
  (pixel coords relative to the hero container; `exits` in `JOBS` order). Consumed by the SVG here and by `BeamCanvas` in Task 4.
- Consumes: existing `locked/preview/onPreview/onLock` props from `App.tsx` (unchanged).

- [ ] **Step 1: dispersion.ts — the geometry hook**

```ts
import { useLayoutEffect, useState, type RefObject } from 'react'

export interface Segment { x1: number; y1: number; x2: number; y2: number }
export interface BeamGeometry { entry: Segment; exits: Segment[]; width: number; height: number }

/** Measures the hero, photo, and role buttons; beams connect their real
 *  positions so layout is the single source of truth (SVG + shader share it). */
export function useBeamGeometry(
  hero: RefObject<HTMLElement | null>,
  photo: RefObject<HTMLElement | null>,
  buttons: RefObject<(HTMLElement | null)[]>,
): BeamGeometry | null {
  const [geom, setGeom] = useState<BeamGeometry | null>(null)
  useLayoutEffect(() => {
    const measure = () => {
      const h = hero.current, p = photo.current
      if (!h || !p) return
      const hr = h.getBoundingClientRect(), pr = p.getBoundingClientRect()
      const rel = (r: DOMRect) => ({ left: r.left - hr.left, top: r.top - hr.top, right: r.right - hr.left, width: r.width, height: r.height })
      const P = rel(pr)
      // entry: viewport-left → photo's left edge, striking at 38% height
      const strike = { x: P.left + 2, y: P.top + P.height * 0.38 }
      const entry = { x1: 0, y1: strike.y - hr.height * 0.06, x2: strike.x, y2: strike.y }
      // exits: photo's right edge (single origin at 55% height) → each button's left-center
      const origin = { x: P.left + P.width - 2, y: P.top + P.height * 0.55 }
      const exits = (buttons.current ?? []).map((b) => {
        if (!b) return { x1: origin.x, y1: origin.y, x2: origin.x, y2: origin.y }
        const br = rel(b.getBoundingClientRect())
        return { x1: origin.x, y1: origin.y, x2: br.left - 10, y2: br.top + br.height / 2 }
      })
      setGeom({ entry, exits, width: hr.width, height: hr.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (hero.current) ro.observe(hero.current)
    return () => ro.disconnect()
  }, [hero, photo, buttons])
  return geom
}
```

- [ ] **Step 2: Hero.tsx — rewrite as the prism hero**

Layout (desktop): left column = eyebrow name, `Hi, I'm Andry. / I am ‹role›`, tagline, GitHub/LinkedIn links, mono caption `dispersion — one identity, four wavelengths`. Center-right = the portrait (`.prism-photo`, slight parallelogram via `clip-path: polygon(6% 0, 100% 0, 94% 100%, 0 100%)` to read as a prism face). Far right = the four role buttons stacked vertically (`.beam-btn`), each a real `<button>` with `aria-pressed`, hover/focus → `onPreview`, click → `onLock` (existing semantics from the flat Hero, including the 2100 ms idle cycle and reset-to-primary on idle).

The SVG overlay (`aria-hidden`, `position:absolute; inset:0`, sized `geom.width × geom.height`, `pointer-events:none`) renders per `geom`:
- entry: white line `stroke="#f2eefb"`, width 2, plus a 6px-wide 0.18-opacity twin for cheap glow;
- each exit `i`: `stroke=JOBS[i].palette.accent`, width 2 + glow twin, with class `beam beam-active|beam-idle|beam-dim` per state.

State → beam class: no lens → the cycling index is `beam-active` (opacity 1), the rest `beam-idle` (0.5); lens set → that beam `beam-active`, others `beam-dim` (0.22). Opacity transitions 400 ms in CSS. Under reduced motion (`matchMedia`, existing pattern) no cycling: all four beams `beam-idle`, primary `beam-active`.

The rotator word keeps `key={shownId}` remount + `role-in` animation and its accent color; `shownId` also drives which beam is `beam-active` so word and light always agree.

- [ ] **Step 3: index.css — hero block rework**

Replace the current `.hero`/`.hero-portrait` block: `.hero { position: relative; min-height: 92svh; display: grid; grid-template-columns: minmax(0,1.05fr) minmax(0,0.9fr) auto; align-items: center; }` with `.hero-svg { position:absolute; inset:0; pointer-events:none; }`. `.beam-btn`: mono font, text-left, transparent bg, `border:1px solid var(--line-strong)`, left border-color = its facet accent when active/locked, `aria-pressed`/`.locked` = filled with its accent (reuse `.focus-chip` rules as the base and rename). Keep `.role`, `.lead`, `.lead-tagline` as-is. Add `.dispersion-caption` (mono, faint, 0.72rem). Photo: keep the accent shadow; add the clip-path; `max-width: 19rem`.

- [ ] **Step 4: Build + drive the states**

`npm run build` clean. Drive with motion emulated ON:
- idle: entry beam + four exit beams visible, brightest beam cycles with the headline word;
- hover each button: that beam brightens, others dim, page accent shifts;
- click: locks (button fills), re-click unlocks;
- Tab: focus rings visible on all four buttons + links, focus previews the beam;
- reduced-motion emulation: static, all beams formed, primary bright, no cycling.
Screenshot each state to the scratchpad and LOOK at them.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Rebuild the hero as the prism: photo splits white light into four facet beams"
```

---

### Task 3: The light carries down the page

**Files:**
- Modify: `src/index.css` (spine, catch-the-light, pull-stat, quest rail, ticks)
- Modify: `src/ui/reveal.ts`

**Interfaces:**
- Consumes: `.reveal`/`.in-view` from the existing IO helper; `data-job` accent vars.
- Produces: `.spine` element rendered by `Panels.tsx` (one `<div className="spine" aria-hidden="true" />` before the sections).

- [ ] **Step 1: The spine**

`Panels.tsx` renders `<div className="spine" aria-hidden="true" />` as the first child of `main.panels` (which becomes `position: relative`). CSS:

```css
.panels { position: relative; }
.spine {
  position: absolute; left: calc(var(--gutter) / 2 - 1px); top: 0; bottom: 0; width: 2px;
  background: linear-gradient(to bottom, var(--accent), color-mix(in srgb, var(--accent) 35%, transparent));
  transform-origin: top; opacity: 0.8;
}
@supports (animation-timeline: scroll()) {
  .spine { animation: spine-grow linear both; animation-timeline: scroll(); }
  @keyframes spine-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
}
@media (max-width: 780px) { .spine { display: none; } }
```

(No scroll-timeline support → spine simply shows fully lit; that is the same as the reduced-motion state, acceptable.)

- [ ] **Step 2: Catch-the-light headings**

`reveal.ts`: unchanged mechanics; additionally observe `.panel h2`. CSS — headings sweep from dim to lit with a moving accent glint via background-clip text:

```css
.panel h2 {
  background: linear-gradient(100deg, var(--ink) 46%, var(--accent) 50%, var(--ink) 54%) 100% 0 / 300% 100% no-repeat text;
  -webkit-text-fill-color: transparent; color: transparent;
}
.panel h2.in-view { animation: catch-light 900ms ease-out both; }
@keyframes catch-light { from { background-position-x: 100%; opacity: 0.2; } to { background-position-x: 0%; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .panel h2 { animation: none; background-position-x: 0%; opacity: 1; } }
```

- [ ] **Step 3: Pull-stat display type + quest rail + facet ticks CSS**

`.pull-stat-value`: `font-size: clamp(3.5rem, 9vw, 7rem)`, weight 200, accent color, tight leading; `.pull-stat-label`: mono, faint, 0.78rem, max 40ch. `.quest` rail: `border-left: 2px solid color-mix(in srgb, var(--accent) 45%, var(--line-strong))` so the timeline reads as the spine's continuation. `.facet-ticks i`: inline-block 14×3px radius 2px, gap 4px.

- [ ] **Step 4: Build + drive + commit**

Build clean; drive with motion: spine draws with scroll, headings catch the light once each, pull-stat reads as a display moment, reduced-motion shows everything formed. Screenshot full page, LOOK.

```bash
git add -A && git commit -m "Carry the light down the page: scroll spine, catch-the-light headings, pull-stat"
```

---

### Task 4: BeamCanvas — the volumetric shader layer

**Files:**
- Create: `src/ui/BeamCanvas.tsx`
- Modify: `src/ui/Hero.tsx` (mount it behind the DOM), `src/index.css` (canvas positioning)

**Interfaces:**
- Consumes: `BeamGeometry` from `useBeamGeometry` (passed as prop), `weights: number[]` (per-facet 0..1 intensity derived from the same state that classes the SVG beams), `accentIndex`.
- Produces: `<BeamCanvas geom={geom} weights={weights} />` — absolutely positioned canvas, `z-index: 0` with hero content at `z-index: 1`; renders nothing when WebGL2 unavailable (SVG remains); one static frame under reduced motion.

- [ ] **Step 1: Component shell + lifecycle**

React component: `useRef<HTMLCanvasElement>`; on mount get `canvas.getContext('webgl2', { alpha: true, antialias: false })` — if null, return cleanup-only (SVG carries the visual). Size = hero rect × min(devicePixelRatio, 2), resized with the geometry. Compile one program (fullscreen triangle). Uniforms: `uRes, uTime, uPointer, uEntryA, uEntryB, uOrigin, uExit[4], uColor[4], uWeight[4], uWhite`. JS side lerps displayed weights toward target weights each frame (`w += (target - w) * 0.08`) so beam collapse eases. `requestAnimationFrame` loop; paused via IntersectionObserver when the hero is off-screen; under `prefers-reduced-motion` render exactly one frame with weights at target and no rAF loop. Pointer parallax: track mouse over the hero, uniform eased the same way. Blending: `gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE)`, clear to transparent — light adds over the page background.

- [ ] **Step 2: The fragment shader (GLSL, inline template string)**

Core technique — additive segment-glow SDF per beam + beam-masked dust + grain:

```glsl
float segDist(vec2 p, vec2 a, vec2 b, out float t) {
  vec2 pa = p - a, ba = b - a;
  t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * t);
}
float beam(vec2 p, vec2 a, vec2 b, float core, float halo) {
  float t; float d = segDist(p, a, b, t);
  float fall = smoothstep(0.0, 0.12, t) * (1.0 - 0.35 * t);   // ignite near source, decay along length
  return (exp(-d * core) + 0.25 * exp(-d * halo)) * fall;
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
```

`main()`: px coords (y-flipped to match DOM), `p += (uPointer - 0.5) * 14.0` for parallax. Accumulate `col += vec3(0.95) * uWhite * beam(p, uEntryA, uEntryB, 0.09, 0.015)`; for i in 0..3 `col += uColor[i] * uWeight[i] * beam(p, uOrigin, uExit[i], 0.07, 0.012)`. Dust: two layers of drifting hashed points (`hash(floor(q / cell))` threshold ≈ 0.996, q advected along each beam's direction by `uTime`), multiplied by the local beam intensity so motes only sparkle inside light. Shimmer: modulate exit weights by `0.94 + 0.06 * sin(uTime * 1.7 + i * 2.1)`. Grain: `+ (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.012`. Output `vec4(col, 1.0)` — additive blend makes alpha moot; keep colors ≤ ~1.2 pre-blend to avoid banding blowout.

- [ ] **Step 3: Mount + tune by eye**

Hero renders `{geom && <BeamCanvas geom={geom} weights={weights} />}` behind the copy. The SVG stays (crisp core line reads as the beam's filament; shader supplies the volume). Iterate on core/halo constants and dust density by screenshotting all four lens states + idle at 1440×900 and mobile 390 until it clears the bar — this step is a look-and-adjust loop, not one shot.

- [ ] **Step 4: Perf + floors verification**

- fps: Playwright context with `deviceScaleFactor: 2`, count rAF ticks over 3 s on the hero — expect ≥ 60.
- reduced motion: exactly one rendered frame (instrument with a counter on `window` in dev, or assert no visual change between two screenshots 1 s apart).
- WebGL blocked (`--disable-webgl` launch arg or stub `getContext` to null): SVG-only hero still complete and legible.
- `?plain=1`: untouched.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Add the volumetric beam shader behind the prism hero"
```

---

### Task 5: Mobile 390 + full floor sweep + polish

**Files:**
- Modify: `src/index.css` (mobile block), possibly small Hero.tsx tweaks

- [ ] **Step 1: Mobile layout**

≤ 780px: hero becomes a vertical stack — entry beam enters from the top edge, photo below it, four beams fan down/out to the role buttons stacked full-width beneath, copy after. The geometry hook already follows real positions, so this is CSS-only: single column grid, `.beam-btn` row-stacked, entry strike point moves to the photo's top edge — add a `vertical` flag to `useBeamGeometry` (`window.matchMedia('(max-width: 780px)')`) that swaps the strike/origin to top/bottom edges. Shader unchanged (same uniforms).

- [ ] **Step 2: The sweep**

Drive and screenshot every floor in one session, LOOK at each:
1. Desktop 1440 idle + each of four locks (5 shots)
2. Mobile 390 idle + one lock
3. Reduced motion desktop + mobile
4. `?plain=1` innerText contains all sections in the new order
5. Keyboard-only pass: Tab order hero links → four beam buttons → content links; Enter locks
6. fps at dpr 2 ≥ 60 (fresh context)
7. `npm run build && node src/content/jobs.selfcheck.ts` clean

- [ ] **Step 3: Commit + note the leftovers**

```bash
git add -A && git commit -m "Finish the dispersion pass: mobile beam layout and full floor sweep"
```

Note in the commit body / session close: `og.png` still shows the old character-select render (existing open item); AGENTS.md re-doc still held until merge.

---

## Self-Review

- Spec coverage: hero (Task 2 + 4), spine/catch-the-light/pull-stat/ticks/rail (Task 3), IA restructure incl. hardware fold + `?plain=1` order (Task 1), mobile + floors (Task 5), perf floor (Tasks 4–5). Covered.
- Placeholders: none — geometry hook, shader technique, and CSS cruxes are written out; Task 4 Step 3 is explicitly a look-and-adjust loop by design, not a placeholder.
- Type consistency: `Segment`/`BeamGeometry` defined once in Task 2 and consumed by Task 4's props; `weights: number[]` naming consistent; `JOB_TAGS`/`tags` consistent between Panels and Sections.
