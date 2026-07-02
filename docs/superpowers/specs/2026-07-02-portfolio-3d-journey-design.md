# Portfolio site: 3D scroll-journey (zeapsu.github.io)

## Context

Post-graduation job hunt; positioning is AI Systems Engineer / Research Software Engineer. The GitHub profile README shipped 2026-07-02; the planned "aesthetic portfolio site" is next. The user upgraded the ambition during brainstorming: this doubles as a passion project — a **full scroll-journey 3D portfolio** (camera travels through staged scenes, galaxy-portfolio style), not a flat page with a backdrop. MVP must ship this session.

**Decisions made with user:**
- Full journey from day one (option 2), MVP this session
- Physics-flavored: the hero centerpiece is a **live 1D spin-1/2 GPE simulation** running in the visitor's browser (authentically his research), rendered as a glowing 3D surface
- Stack from his own prototype at `~/Projects/girlfriend-birthday-site/prototype`: **Vite + TypeScript + React + @react-three/fiber + drei + GSAP**; reference vibe: `~/Projects/girlfriend-birthday-site/reference` (techinz/galaxy-portfolio, zoom-through-scenes) and babs-gift `journey.html` (dark, radial glows, big clamp() type)
- Content: single narrative, sourced **strictly from `~/Documents/personal/experience.md`** — no invented claims. Research section + 5 project cards: reachy-console, Kalshi, Sage, daily-hub, quantum (QPO+QEC). Private repos described without links ("ask me about it")
- Voice: the shipped README (personal, understated). Style rules: direct, **no em dashes**, no filler
- Hosting: new public repo `zeapsu/zeapsu.github.io`, GitHub Pages via Actions

## Architecture

New repo at `~/Projects/zeapsu.github.io`. Vite + TS + React.

```
src/
  sim/gpe.ts          # 1D spin-1/2 GPE split-step solver (CPU, Float32Array, ~256 pts)
  three/QuantumField.tsx  # sim -> glowing ribbon/surface mesh, updated per frame
  three/Journey.tsx   # ScrollControls + camera timeline through 4 scenes
  three/scenes/*.tsx  # per-scene set pieces (hero field, research, project stations, contact)
  content/data.ts     # all copy + project facts (single file, easy to audit against experience.md)
  ui/*.tsx            # DOM overlays (drei Scroll html) for text: accessible, selectable
```

**Journey (4 scenes on one scroll timeline, drei `ScrollControls` + `useScroll` driving camera via GSAP-style lerps):**
1. **Hero** — void with the live GPE quantum field below; name, one-liner, contact links
2. **Research** — camera dives toward/along the field; SJSU RA content (BEC sims, 1,880x DVR speedup, HDF5/Slurm pipeline, ~13 reports)
3. **Projects** — camera glides past 5 floating project "stations"; each: name, one honest sentence, 2-3 concrete facts, GitHub link if public
4. **How I work + contact** — verification-first ethos, open-to-roles, email; judo/GW2 personality line

**GPE sim:** split-step Fourier (or finite-difference Strang) on a 1D two-component field, quench c2 to trigger domain-wall formation, loop by re-quenching. Small radix-2 FFT written in-file. Caption in hero: honest one-liner that it's the real equations. He validated exactly this physics at SJSU, so correctness is checkable: domain walls must form, norm conserved.

**Perf/accessibility guardrails (not skippable):**
- DOM text as real HTML overlays, never texture-baked text
- `prefers-reduced-motion`: static camera, sim frozen after first frames
- Pause render loop on hidden tab; cap DPR at 2; drop particle counts on mobile
- Page usable (all text readable, links clickable) even if WebGL fails: plain fallback

## MVP steps (this session)

1. Scaffold repo (`npm create vite@latest` react-ts), add three/r3f/drei/gsap, commit design doc to `docs/superpowers/specs/` per superpowers convention
2. `sim/gpe.ts` with a tiny assert-based self-check (norm conservation, wall formation) — TDD per superpowers
3. `QuantumField` mesh + hero scene; verify visually via `npm run dev` + Playwright screenshot
4. Journey scroll timeline + remaining scenes with content from `experience.md` (`content/data.ts`)
5. Dark-glow styling (babs-gift journey.html palette direction), frontend-design skill for craft
6. Reduced-motion + WebGL-fail fallbacks
7. GitHub Actions Pages deploy; create repo `zeapsu/zeapsu.github.io`, push, verify live URL

Post-MVP (later sessions): richer per-scene set pieces, mobile tuning, OG image, maybe 2D GPU field.

## Verification

- `npx tsc -b && npm run build` clean
- `node`-run (or vitest-less) sim self-check passes: norm error < 1e-6 over the loop, ≥2 domain walls after quench
- Drive `npm run dev` with Playwright: screenshot each scroll position, check text present in DOM, links resolve
- Lighthouse quick pass (perf + a11y) on the built preview
- After deploy: `curl -sI https://zeapsu.github.io` 200 + manual look
- Audit every claim on the page against `experience.md` exclusions (no JAX, no GPU claims, no TokenMeter, correct "live-verified" PR citations)
