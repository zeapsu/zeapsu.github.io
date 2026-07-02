# AGENTS.md

Guidance for coding agents (Claude Code, Codex, etc.) working in this repo. CLAUDE.md is a symlink to this file.

## What this is

Andry's portfolio site, live at https://zeapsu.github.io. A 3D scroll-journey (Vite + TypeScript + React + @react-three/fiber + drei) whose centerpiece is a live 1D spin-1/2 Gross-Pitaevskii simulation rendered as a spacetime terrain. It is both a job-hunt artifact and an ongoing passion project, so craft matters and shortcuts that show are not acceptable on the visual surface.

Design spec: `docs/superpowers/specs/2026-07-02-portfolio-3d-journey-design.md`.

## Commands

```bash
npm run dev                      # dev server
npm run build                    # tsc + vite build (must stay clean)
node src/sim/gpe.selfcheck.ts    # physics self-check; CI runs this on every deploy
```

Deploy is automatic: push to main runs `.github/workflows/deploy.yml` (build + selfcheck + Pages).

## Content rules (strict)

- All site copy lives in `src/content/data.ts` and must be traceable to `~/Documents/personal/experience.md` (private repo, available on both machines). Never invent claims. Respect that file's exclusions section.
- The Kibble-Zurek / quench research bullet stays OFF the site until Dr. Hurst reviews the wording.
- Voice: the github.com/zeapsu/zeapsu README. Direct, personal, understated. No em dashes, no filler, authenticity over polish.
- Private projects (reachy-console, Kalshi, daily-hub) are described without links, "ask me about it" style.

## Workflow

- **Issue-driven.** Work maps to GitHub issues; check `gh issue list` before starting, file new issues for anything noticed but not fixed. Close issues from commits/PRs (`Fixes #N`).
- **Branches + PRs for non-trivial work.** Small doc/copy fixes can land on main; anything touching the sim, camera, or visuals goes through a branch and PR so the history stays reviewable.
- **Rich git history.** Commit messages explain what and why, present imperative subject, body for the reasoning and verification evidence. No squashed mystery blobs.
- **Verify before claiming done.** `npm run build` clean, selfcheck passing, and for anything visual: drive the real page and look at it. On the Jetson the Playwright MCP does not work (wants a Chrome channel that does not exist on arm64); use playwright-core + snap chromium with `--enable-unsafe-swiftshader`. Screenshot scripts from the first session live in the session scratchpad pattern: launch chromium via `executablePath: '/usr/bin/chromium-browser'`, scroll drei's overflow container (largest div with scrollHeight > 2x clientHeight), screenshot at several offsets. Check reduced-motion (static frames), no-WebGL fallback (all content in innerText), and mobile (390px).
- **Session close.** Update Claude's memory (`planned-portfolio-and-gh-readme.md` in the project memory dir) with what shipped and what is open, and record status changes in `~/Documents/personal/project-status.md` (pull, edit, commit, push per that repo's AGENTS.md).

## Machine notes

- Jetson Orin Nano (this repo's birthplace): headless; visual verification only via the chromium screenshot loop above. Rendering there is swiftshader, so treat its colors/AA as approximate. Bloom is intentionally disabled under swiftshader (and on mobile) by `src/three/quality.ts`, so Jetson screenshots never show crest halos — that is the switch working, not a rendering bug.
- MacBook: preferred for perceptual polish (contrast, motion feel, scroll pacing) with a real display and browser tools. Clone, `npm install`, continue; memory context lives on the Jetson via `ssh`. The Playwright MCP plugin works here; use `browser_run_code_unsafe` and pass `page.screenshot({ path })` an absolute path outside the repo (e.g. the session/job tmp dir) — screenshots taken without a path land in the repo root and have to be cleaned up before committing. For contrast checks, emulate prefers-reduced-motion (`page.emulateMedia({reducedMotion: 'reduce'})`): the frozen path shows fully formed domains, the deterministic brightest terrain. Live-sim screenshots catch dim phases of the 34s quench cycle and understate contrast problems.

## Guardrails (do not simplify away)

- The sim must stay honest physics: the hero caption says it is a real Gross-Pitaevskii simulation, so it has to remain one. Any solver change keeps a node-runnable self-check.
- Accessibility floor: real DOM text (never texture-baked), prefers-reduced-motion respected, no-WebGL fallback renders all content, visible focus states.
