# AGENTS.md

Guidance for coding agents (Claude Code, Codex, etc.) working in this repo. CLAUDE.md is a symlink to this file.

## What this is

Andry's portfolio site, live at https://zeapsu.github.io. The Dispersion redesign (Vite + TypeScript + React, no router): one identity, four facets, told as light through a prism. A rainbow incident beam strikes the real portrait, recombines in a white burst, and splits into four facet-colored beams whose bare-text labels are the filter — hovering previews a focus, clicking locks it, and the headline, tagline, page accent, project sort, skill lighting, and resume all follow. Below the hero, opaque sheets alternate light/dark with slanted seams and stack as a sticky deck. Built on branch `feat/flat-redesign`, shipped via PR #33 (spec: `docs/superpowers/specs/2026-07-07-dispersion-redesign-design.md`; round-two direction changes live in the git log, which is authoritative where they differ). It is both a job-hunt artifact and a passion project: craft matters, and shortcuts that show are not acceptable on the visual surface.

Rollback lineage, oldest first: `journey-v1` (3D scroll journey), `vista-r3f-v1` (Blender vista), `themed-3d-v1` (character-select worlds + live GPE sim — the pre-redesign live site), each with a matching `legacy/*` branch. The Gross-Pitaevskii sim was deliberately dropped from the site 2026-07-06; do not resurrect it here (its honest-physics guardrail retired with it).

Current backlog: og.png only — the MVP is complete. #32 (per-section signature animations) closed 2026-07-08 via PRs #35/#36/#37: NOW's pull-stat counts up on the scrub in a shared `.panel-split` two-column layout (pure-CSS `@property` counter riding `--sheet`; the property must inherit to reach the `::before`, and mid-sheet elements are only visible from ~entry 50% so ranges start late), PATH's straight rail became a crooked drawn SVG route (dashoffset scrub; <=1100px falls back to the rail list), and the closer gained `CloserGlow.tsx` (raw-WebGL2 BeamCanvas fork: four beams recombine to white; own-visibility GPU gate since it is the last sheet, epoch-key context-loss remount, panel-background paper uniform, SVG twin without WebGL2). Eyebrows trimmed to hero + NOW. #31 (content fine-tuning) closed 2026-07-08 after two passes: PR #34 (honesty fixes, the robotics facet reframed to physical AI, Sigma Pi Sigma, About+Contact merged into one "Off the clock" closing sheet — the deck is six sheets) and two direct-to-main copy commits; every visible string got an explicit keep/change call. The pre-redesign issues that described the retired 3D site were triaged and closed 2026-07-07.

#40 + #41 closed 2026-07-11 via PR #42: the four facets read as disciplines, not held titles — Physics, AI Systems Engineering, Research Software, Robotics — and the headline is "I work in {name}". The swe facet is deliberately the short 'Research Software': at 1141px the role column (457px) cannot hold "I work in Research Software Engineering" even at the `.role-line` 0.5em font floor (539px measured), so #41's fallback ladder applied both steps (0.5em + short name); the skillTree branch label keeps the full 'Research Software Engineering', and 'AI Systems Engineering' (445px) is the longest role the one-line invariant is tuned to. Audit copy: proxy metrics (test/commit counts) are off the cards; outcome numbers stay. New ai-systems tokens (K/I-quants, LoRA fine-tuning, KV-cache tradeoffs, MoE pruning, llama.cpp (ARM64 CUDA source build), agent harnesses) trace to experience.md; the individual harness names and vLLM/TensorRT-LLM stay off the site.

## Commands

```bash
npm run dev                          # dev server
npm run build                        # tsc + vite build (must stay clean)
node src/content/jobs.selfcheck.ts   # content/palette selfcheck; CI runs this on every deploy
```

Deploy is automatic: push to main runs `.github/workflows/deploy.yml` (selfcheck + build + Pages).

## Architecture map

- `src/content/data.ts` — ALL site copy, plus per-project `jobs` facet tags. `src/content/jobs.ts` — the four facets, palette hexes, primary focus. The selfcheck asserts palette agreement with the four `:root[data-job]` blocks in `index.css`; hexes live only in those two places.
- `src/ui/Hero.tsx` + `dispersion.ts` (DOM-measured beam geometry) + `BeamCanvas.tsx` (raw WebGL2 volumetric layer) — the prism hero. The canvas paints the page background itself in both themes; never reintroduce a CSS blend mode on it (the sticky hero's stacking context isolates blends from the page and leaves seams).
- `src/ui/SkillField.tsx` → lazy `SkillCloud3D.tsx` (the only three/R3F usage, a deferred chunk) — volumetric skill cloud; 2D flowed field under reduced motion, without WebGL2, and on small screens' CSS. troika Text's live color is `mesh.material.color`; never setState in useFrame; a lost GL context is remounted via the Canvas `key` epoch.
- `src/ui/Panels.tsx` / `Sections.tsx` — the sheet deck and the `?plain=1` fallback. Per-section theming via `data-theme` attributes; the lights toggle (App.tsx) flips every sheet while preserving the alternation, persists as `localStorage.lightsOff`, and is applied pre-paint by an inline script in `index.html`.
- `src/ui/reveal.ts` + the choreography blocks in `index.css` — entrances ride each sheet's named view timeline (`view-timeline: --sheet`), scrubbing with scroll and rewinding; the IntersectionObserver transitions are the fallback for browsers without scroll-driven animations. The deck's dwell distances and `--stick-top` measurement live here too.
- GPU gates: sticky sheets never leave the viewport, so both canvases pause by watching the NEXT sheet crossing the viewport-top line (`rootMargin: '0px 0px -100% 0px'`), not their own intersection.

## Content rules (strict)

- All site copy lives in `src/content/data.ts` and must be traceable to `~/Documents/personal/experience.md` (private repo, available on both machines). Never invent claims. Respect that file's exclusions section (daily-hub came off the site under it — #30).
- The Kibble-Zurek / quench research bullet is cleared and ON the site (wording cleared 2026-07-04); it lives in `research.facts`. Contact info is cleared for publication; the job-aware resume PDFs are wired (contact button resolves per focus, PDFs in `public/resume/`).
- The About section is personal off-the-clock content (interests trace to experience.md's Personal section); the robotics facet leads with physical AI / intelligence on edge devices, not specific hardware — Reachy/Jetson stay at the project-card level.
- Voice: the github.com/zeapsu/zeapsu README. Direct, personal, understated. No em dashes anywhere in visible copy, no filler, authenticity over polish.
- Private projects (reachy-console, Kalshi) are described without links; the "ask me about it" framing lives in their blurbs.
- Work-card images are real artifacts only (actual UI screenshots, actual plots) — no mockups, no decorative renders, nothing with empty axes.

## Workflow

- **Issue-driven.** Work maps to GitHub issues; check `gh issue list` before starting, file new issues for anything noticed but not fixed. Close issues from commits/PRs (`Fixes #N`).
- **Superpowers skills are preferred, not required.** Good first reach for planning and implementation; don't force a skill where judgment serves better. The design-taste-frontend skill is the vetting bar for visual work.
- **Branches + PRs for non-trivial work.** Small doc/copy fixes can land on main; anything touching the hero shader, the deck, or visuals goes through a branch and PR. Merge only after both code review and Andry's own review.
- **Rich git history.** Commit messages explain what and why, present imperative subject, body for reasoning and verification evidence.
- **Verify before claiming done.** `npm run build` clean, selfcheck passing, and for anything visual: drive the real page and look at it. The site is scroll-driven and `load` settles normally (the R3F chunk is lazy). Headless Playwright defaults to reduced motion — `page.emulateMedia({ reducedMotion: 'no-preference' })` to see and test motion. Drive: the hero idle cycle (role + tagline swap together), hover-preview and click-lock on the beam labels, the lights toggle (both grounds), and the deck scrub (entrances form on the way down, rewind on the way up). Always also check: reduced motion (fully formed static frames everywhere), no-WebGL2 (SVG hero + 2D skill field), `?plain=1` (all content in innerText), and mobile 390 (vertical beam, no horizontal scroll).
- **Session close.** Run the `close` skill: update Claude's memory (`planned-portfolio-and-gh-readme.md` in the project memory dir) with what shipped and what is open, and record status changes in `~/Documents/personal/project-status.md` (pull, edit, commit, push per that repo's AGENTS.md).

## Machine notes

- MacBook: the primary dev + verification machine. The Playwright MCP plugin is Claude Code-only — it is NOT registered in omp sessions; there, drive the site with playwright-core scripts (pattern in `~/tmp/pw-qa/qa.mjs`, launching the ms-playwright cached "Google Chrome for Testing.app" binary). In Claude Code use `browser_run_code_unsafe`. Either way pass `page.screenshot({ path })` an absolute path outside the repo — pathless screenshots land in the repo root and must be cleaned before committing. For FPS work, create the context with `deviceScaleFactor: 2`; `setViewportSize` alone leaves dpr at 1 and hides all fill-rate cost.
- Jetson Orin Nano: headless; the Playwright MCP does not work there (no arm64 Chrome channel). Screenshot via playwright-core + snap chromium (`executablePath: '/usr/bin/chromium-browser'`, `--enable-unsafe-swiftshader`); treat swiftshader colors/AA as approximate. Pull before acting there — the MacBook is usually ahead.

## Guardrails (do not simplify away)

- Honest visuals: the beams and sheets are art direction, but every number, claim, and image on the page is real and traceable. No decorative fake data, ever.
- Craft-first, AAA bar: iterate until it clears the bar, with a perf floor of 60 fps at deviceScaleFactor 2 on the MacBook (build the look, then optimize to the floor). Kill agent-UI memes on sight (glowing chip buttons, decorative captions, eyebrow spam).
- Both grounds: the lights toggle flips every sheet, so any new visual (canvas, shader, plot) must read on light paper AND near-black — theme-blind hardcoded colors are bugs.
- Accessibility floor: real DOM text (never canvas-baked — the 3D cloud's sr-only list is the pattern), prefers-reduced-motion gets formed static states, no-WebGL fallback renders all content, visible focus states, keyboard lock/unlock on the beam labels.
