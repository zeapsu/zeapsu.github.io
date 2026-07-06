# AGENTS.md

Guidance for coding agents (Claude Code, Codex, etc.) working in this repo. CLAUDE.md is a symlink to this file.

## What this is

Andry's portfolio site, live at https://zeapsu.github.io. A character-select portfolio (Vite + TypeScript + React; @react-three/fiber for the job worlds): one character, four jobs, each job re-theming the site and carrying its own world. The live 1D spin-1/2 Gross-Pitaevskii simulation remains the Physicist world's centerpiece. Design spec: docs/superpowers/specs/2026-07-02-character-select-redesign-design.md (shipped to main via PR #18 on 2026-07-04; this is the live site). It is both a job-hunt artifact and an ongoing passion project, so craft matters and shortcuts that show are not acceptable on the visual surface.

Rollback: the previous 3D scroll-journey site is preserved at tag `journey-v1` and branch `legacy/journey-site`; its now-historical design spec is `docs/superpowers/specs/2026-07-02-portfolio-3d-journey-design.md`. A few journey-era modules still linger in the tree (`src/layout.ts`, `src/three/JourneyCamera.tsx`) — treat them as legacy pending cleanup (see #16).

Back to normal issue-driven workflow: pick up open issues (#19-#24 are the current backlog), branch, open a PR per session. The one-shot loop-to-finish session that built the redesign is done.

## Commands

```bash
npm run dev                      # dev server
npm run build                    # tsc + vite build (must stay clean)
node src/sim/gpe.selfcheck.ts    # physics self-check; CI runs this on every deploy
```

Deploy is automatic: push to main runs `.github/workflows/deploy.yml` (build + selfcheck + Pages).

## Content rules (strict)

- All site copy lives in `src/content/data.ts` and must be traceable to `~/Documents/personal/experience.md` (private repo, available on both machines). Never invent claims. Respect that file's exclusions section.
- The Kibble-Zurek / quench research bullet is cleared and ON the site (Andry cleared the wording 2026-07-04); it lives in `research.facts` in `src/content/data.ts`. Contact info is likewise cleared for publication; the job-aware resume PDFs still need wiring (#24).
- Voice: the github.com/zeapsu/zeapsu README. Direct, personal, understated. No em dashes, no filler, authenticity over polish.
- Private projects (reachy-console, Kalshi, daily-hub) are described without links, "ask me about it" style.

## Workflow

- **Issue-driven.** Work maps to GitHub issues; check `gh issue list` before starting, file new issues for anything noticed but not fixed. Close issues from commits/PRs (`Fixes #N`).
- **Superpowers skills are preferred, not required.** They're a good first reach for planning and implementation — brainstorming before design work, systematic-debugging on bugs, TDD for features — but pick the tool that fits the task. Don't force a skill where your own judgment serves better.
- **Branches + PRs for non-trivial work.** Small doc/copy fixes can land on main; anything touching the sim, camera, or visuals goes through a branch and PR so the history stays reviewable. Merge only after both code review and Andry's own review.
- **Rich git history.** Commit messages explain what and why, present imperative subject, body for the reasoning and verification evidence. No squashed mystery blobs.
- **Verify before claiming done.** `npm run build` clean, selfcheck passing, and for anything visual: drive the real page and look at it. On the Jetson the Playwright MCP does not work (wants a Chrome channel that does not exist on arm64); use playwright-core + snap chromium with `--enable-unsafe-swiftshader`. Screenshot scripts launch chromium via `executablePath: '/usr/bin/chromium-browser'`. The site is phase-driven, not scroll-driven: drive start (near-black) → dive (the SAO "Link Start" cinematic; any input skips; reduced-motion and no-WebGL bypass it straight to select) → select (press a key) → equip a job (focus a job card, click, Enter), and switch worlds in place with the terminal `job <name>` command (equipped panels still scroll vertically over the world). The persistent render loop stops `networkidle`/`load` from ever settling, so navigate with `waitUntil: 'commit'` plus an explicit wait. Check reduced-motion (each world holds a formed static frame), no-WebGL fallback / `?plain=1` (all content in innerText), and mobile (390px).
- **Session close.** Run the `close` skill: update Claude's memory (`planned-portfolio-and-gh-readme.md` in the project memory dir) with what shipped and what is open, and record status changes in `~/Documents/personal/project-status.md` (pull, edit, commit, push per that repo's AGENTS.md).

## Machine notes

- Jetson Orin Nano (this repo's birthplace): headless; visual verification only via the chromium screenshot loop above. Rendering there is swiftshader, so treat its colors/AA as approximate. Bloom is intentionally disabled under swiftshader (and on mobile) by `src/three/quality.ts`, so Jetson screenshots never show crest halos — that is the switch working, not a rendering bug.
- MacBook: preferred for perceptual polish (contrast, motion feel, scroll pacing) with a real display and browser tools. Clone, `npm install`, continue; memory context lives on the Jetson via `ssh`, and the vendored galaxy-portfolio reference is viewable from here over `ssh zeapsu@ubuntu` (`~/Projects/girlfriend-birthday-site/reference`). The Playwright MCP plugin works here; use `browser_run_code_unsafe` and pass `page.screenshot({ path })` an absolute path outside the repo (e.g. the session/job tmp dir) — screenshots taken without a path land in the repo root and have to be cleaned up before committing. For contrast checks, emulate prefers-reduced-motion (`page.emulateMedia({reducedMotion: 'reduce'})`): the frozen path shows fully formed domains, the deterministic brightest terrain. Live-sim screenshots catch dim phases of the 34s quench cycle and understate contrast problems. For FPS profiling, create the browser context with `deviceScaleFactor: 2` (mobile: 3 + `hasTouch`) — `setViewportSize` alone leaves dpr at 1, which hides all fill-rate cost (this produced the misleading 110fps number in issue #10; the real retina baseline was 58). Profile each world in a fresh `newContext` — a reused context can wedge on WebGL teardown and hang re-navigation; the four worlds measured 116/119/116/126 fps at true dpr 2 (2880x1800) on 2026-07-04. Aliasing is the opposite: invisible at dpr 2, severe at dpr 1 (Andry's external monitor) — check edge quality in a `deviceScaleFactor: 1` context at ~2560x1440 and judge with 4x nearest-neighbor zoom crops, and profile AA features at both dprs. SMAA cannot fix this palette's dim silhouette edges (PR #15); the working fix is `composerSamples()` in `src/three/quality.ts`.

## Guardrails (do not simplify away)

- The sim must stay honest physics: the hero caption says it is a real Gross-Pitaevskii simulation, so it has to remain one. Any solver change keeps a node-runnable self-check.
- Craft-first, AAA bar (direction amendment 2026-07-03 in the redesign spec): the quality target is a AAA game title screen, and the old frugality rules are RETIRED — do not resurrect "build cheap / kill without ceremony", "one set piece per view", or perf-as-per-frame-veto. What replaces them: one coherent art direction per job (layered visuals welcome when they serve it; cut rivals to coherence, not layers), iterate until it clears the bar, and a perf floor of 60 fps at deviceScaleFactor 2 on the MacBook (build the look, then optimize to the floor). Worlds must still be real data, real math, or a labeled true-fact metaphor; no decorative cosplay.
- Accessibility floor: real DOM text (never texture-baked), prefers-reduced-motion respected, no-WebGL fallback renders all content, visible focus states.
