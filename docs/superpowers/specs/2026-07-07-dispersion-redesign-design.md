# Dispersion redesign — design spec

Date: 2026-07-07 · Branch: `feat/flat-redesign` (builds on the flat checkpoint `be34488`)
Status: approved by Andry in-session (concept, photo-as-prism, section IA).

## Concept

One identity, four facets — rendered as the one piece of physics everyone knows
by sight: **white light through a prism**. Andry's real photo is the prism. A
thin white beam enters from the left edge of the viewport and strikes the
portrait; four colored beams exit the other side, fanning out to the four
roles: teal Physicist, violet AI Systems Engineer, amber Research SWE, orange
Roboticist. Dispersion is real optics and Andry is a real physicist, so the
metaphor is honest; it also finally explains *why* the site has four accent
hues.

The concept replaces the template-shaped flat hero. Everything else in the
flat checkpoint that works — the audited content in `data.ts`, the
lens/preview/lock filter mechanic, the CSS-var accent system, the a11y floors,
zero animation deps — is kept and re-expressed through the concept.

## Hero

- Dark field. SVG beam enters from the left viewport edge, strikes the
  portrait frame; four colored beams exit right/downward, each terminating at
  a role label.
- **Beam labels are the filter.** Real HTML `<button>`s positioned at beam
  ends (the SVG beams are decorative, `aria-hidden`). Hover/focus previews the
  facet, click locks it, re-click unlocks — the exact mechanic from the flat
  checkpoint, re-skinned. `aria-pressed` on lock, visible focus rings.
- **Headline keeps the rotator.** Idle: the brightest exit beam slowly cycles
  in sync with "I am a/an ‹role›". Engaging a beam locks both. Locking
  collapses the exit light toward that single wavelength — other beams dim
  but never vanish — and tunes the whole page accent (existing `@property`
  transition).
- Idle tagline stays `identity.tagline`; an engaged facet swaps in the role
  tagline (unchanged behavior).
- A small mono caption labels the metaphor (e.g. `dispersion — one identity,
  four wavelengths`). It is a label, not a biographical claim; no new claims
  are added anywhere.
- Implementation: SVG (lines/polygons, gradients, filter glow) + CSS only.
  No WebGL, no new dependencies.

## The light carries down the page

- The active wavelength continues below the hero as a **thin light spine** in
  the left gutter, drawn/progressed by scroll. CSS scroll-driven animation
  (`animation-timeline: scroll()`) where supported; IntersectionObserver
  fallback (extend the existing `reveal.ts`).
- Section reveals become "catch the light": a brightness/color sweep across
  the heading as it enters view, body fades up. Replaces the generic
  translateY fade.
- Sections get layout variety instead of uniform stacked panels — see the IA
  below for per-section treatments.

## Section IA (revised this session)

Order chosen: research-as-Now first (present-tense job leads), then work,
path, recognition, about+contact. Every audited fact in `data.ts` is kept;
this is restructuring, not cutting. Conventional bones, personal flesh: the
distinctive lines ("The route here was not a straight line", "Verification
first") become intro copy *inside* conventionally-named sections, not section
headers.

1. **HERO** — prism + facets (filter).
2. **NOW** — the SJSU research section, framed explicitly as current work.
   The 1,880× speedup becomes a display-type pull-stat. Full facts list stays.
3. **WORK** — selected projects. The hardware photos (Reachy, Jetson) fold
   into the reachy-console project card's context instead of a floating
   gallery. Project cards get small wavelength ticks for their facet tags;
   lens re-sort + featured glow unchanged.
4. **PATH** — the experience timeline. The RA entry becomes a one-liner
   pointing up to NOW (no duplication). "The route here was not a straight
   line" moves from H2 to intro copy. The timeline rail is the light spine
   itself.
5. **RECOGNITION** — honors and credentials, kept as its own section
   (Andry's explicit call). Credential links unchanged.
6. **ABOUT + CONTACT** — the verification-first paragraph (with judo/GW2
   personality), the four-branch skills grid (branch lights with the lens),
   focus-aware resume download, email, footer line.

## Floors (unchanged commitments)

- **Reduced motion:** beams fully formed and static, no cycling, spine fully
  lit, headline holds the primary focus. Every content element readable.
- **`?plain=1`** plain-text path untouched (update its section order to
  match).
- **Mobile 390px:** beam enters top, photo, beams fan down into a stacked
  role list; spine hidden or simplified if it fights the narrow gutter.
- Real DOM text everywhere; visible focus states; no texture-baked text.
- All copy traceable to `~/Documents/personal/experience.md`; the only new
  strings are structural labels (section eyebrows, the dispersion caption).

## Implementation constraints

- No new dependencies. SVG + CSS (+ the existing ~30-line reveal helper).
  Bundle stays in the ~210 kB neighborhood.
- `jobs.selfcheck.ts` must keep passing (palette blocks stay in sync).
- Verification per AGENTS.md: `npm run build` clean; drive the real page on
  the MacBook (Playwright MCP, `emulateMedia` for motion), check reduced
  motion, `?plain=1`, mobile 390, keyboard traversal of the beam buttons.

## Risks

This concept is the rabbit-hole-shaped kind. The scope ceiling is structural:
SVG+CSS only, one page, no new deps, six sections. If a beam effect demands
WebGL or a new library, the answer is a simpler beam, not a bigger toolbox.
