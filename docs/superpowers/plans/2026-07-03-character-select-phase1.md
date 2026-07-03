# Character-Select Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The character-select gate, per-job theming tokens, and the shared panel skeleton — the site's new shell, on the `redesign/character-select` branch, with placeholder worlds (zones land in phase 3).

**Architecture:** A `jobs.ts` content module defines the four jobs (palette, copy, level). App holds `job` state; selecting a job stamps `data-job` on `<html>`, which switches CSS custom-property theme blocks. The select screen is a DOM overlay (no 3D in phase 1); the panel skeleton renders in normal document flow beneath it (real DOM, inert while gated). `?plain=1` renders the existing `StaticFallback` ungated. The three/sim code stays on disk untouched — the Physicist zone reconnects it in phase 3.

**Tech Stack:** React 19, Vite 8, TypeScript, plain CSS custom properties (no new dependencies). Tests via node-runnable selfchecks (house pattern, like `gpe.selfcheck.ts`).

## Global Constraints (from the spec)

- All copy traceable to `~/Documents/personal/experience.md`; no invented claims; no em dashes in site copy; Kibble-Zurek stays off.
- Real DOM text always; visible focus states; prefers-reduced-motion honored (no equip animation); the plain-text path carries ALL content ungated.
- Literal job names lead, flavor subtitles second; honest levels (Roboticist = leveling).
- Work email only: andryypaez@gmail.com. LinkedIn slug includes "lloyd".
- `npm run build` stays clean; `node src/sim/gpe.selfcheck.ts` keeps passing (untouched but CI runs it).
- No new npm dependencies in phase 1.

## File Structure

- `src/content/jobs.ts` (new) — job definitions: id, name, subtitle, level, tagline, palette. Pure data, no asset imports (node-checkable).
- `src/content/jobs.selfcheck.ts` (new) — node-runnable assertions on the job table.
- `src/assets/portraits/{base,physicist,ai-systems,swe,robotics}.jpg` (new) — processed from private v3 PNGs.
- `src/ui/CharacterSelect.tsx` (new) — the gate: portrait, nameplate, job cards, plain link.
- `src/ui/Panels.tsx` (new) — shared panel skeleton: About, Quest Log, Quest Board, Skill Tree, Achievements, Contact.
- `src/App.tsx` (rewrite on branch) — job state machine; gate/shell/plain routing.
- `src/index.css` (extend) — token blocks per job, select-screen, panels, equip transition, reduced-motion.
- `AGENTS.md` (modify) — guardrail update per spec.
- `src/ui/Sections.tsx` — only `StaticFallback` + `ContactLinks` + `ProjectCard` remain used; `Sections` (journey layout) becomes unused on this branch but stays on disk for phase 3 reference. Do not delete.

---

### Task 1: Job table with selfcheck

**Files:**
- Create: `src/content/jobs.ts`
- Create: `src/content/jobs.selfcheck.ts`

**Interfaces:**
- Produces: `type JobId = 'physicist' | 'ai-systems' | 'swe' | 'robotics'`; `interface Job { id: JobId; name: string; subtitle: string; level: 1 | 2 | 3 | 4; tagline: string; palette: { accent: string; accentDim: string; bg0: string; bg1: string } }`; `const JOBS: Job[]`; `function isJobId(v: string | null): v is JobId`. Later tasks import all of these.

- [ ] **Step 1: Write the failing selfcheck**

`src/content/jobs.selfcheck.ts`:
```ts
// Run: node src/content/jobs.selfcheck.ts  (same pattern as gpe.selfcheck.ts)
import assert from 'node:assert'
import { JOBS, isJobId } from './jobs.ts'

// 1. Exactly four jobs, unique ids, in select-screen order.
assert.deepStrictEqual(
  JOBS.map((j) => j.id),
  ['physicist', 'ai-systems', 'swe', 'robotics'],
)

// 2. Every palette entry is a hex color.
for (const j of JOBS) {
  for (const [k, v] of Object.entries(j.palette)) {
    assert.match(v, /^#[0-9a-f]{6}$/i, `${j.id}.palette.${k} = ${v}`)
  }
  assert.ok(j.name.length > 0 && j.subtitle.startsWith('the '), j.id)
  assert.ok(j.tagline.length > 0 && !j.tagline.includes('—'), `${j.id} tagline (no em dashes)`)
  assert.ok(j.level >= 1 && j.level <= 4, j.id)
}

// 3. Honest levels: robotics is the only level-1 job.
assert.strictEqual(JOBS.filter((j) => j.level === 1).length, 1)
assert.strictEqual(JOBS.find((j) => j.level === 1)!.id, 'robotics')

// 4. isJobId guards.
assert.ok(isJobId('physicist') && !isJobId('warlock') && !isJobId(null))

console.log('jobs selfcheck passed')
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node src/content/jobs.selfcheck.ts`
Expected: FAIL — `Cannot find module './jobs.ts'`

- [ ] **Step 3: Implement the job table**

`src/content/jobs.ts`:
```ts
// The four jobs of the character-select conceit (spec:
// docs/superpowers/specs/2026-07-02-character-select-redesign-design.md).
// Taglines are audited against ~/Documents/personal/experience.md like all copy.

export type JobId = 'physicist' | 'ai-systems' | 'swe' | 'robotics'

export interface Job {
  id: JobId
  name: string
  subtitle: string
  /** 1-4 pips; honest: robotics is genuinely leveling. */
  level: 1 | 2 | 3 | 4
  tagline: string
  palette: { accent: string; accentDim: string; bg0: string; bg1: string }
}

export const JOBS: Job[] = [
  {
    id: 'physicist',
    name: 'Physicist',
    subtitle: 'the Scholar',
    level: 4,
    tagline: 'Quantum information and computational physics, from QAOA portfolio benchmarks to condensate simulations.',
    palette: { accent: '#4fd8c8', accentDim: '#1e6f8f', bg0: '#061018', bg1: '#0a1c28' },
  },
  {
    id: 'ai-systems',
    name: 'AI Systems Engineer',
    subtitle: 'the Summoner',
    level: 4,
    tagline: 'Agents, local inference, and edge hardware I can point at.',
    palette: { accent: '#b48cff', accentDim: '#6b4a9e', bg0: '#0d0a1a', bg1: '#161028' },
  },
  {
    id: 'swe',
    name: 'Research SWE',
    subtitle: 'the Artificer',
    level: 3,
    tagline: 'Verification first: tests re-run, diffs read, apps driven.',
    palette: { accent: '#f0a848', accentDim: '#9a6a2a', bg0: '#120e08', bg1: '#1e1810' },
  },
  {
    id: 'robotics',
    name: 'Roboticist',
    subtitle: 'the Automaton',
    level: 1,
    tagline: 'Currently leveling: a Reachy Mini living on a Jetson Orin Nano.',
    palette: { accent: '#ff7a45', accentDim: '#9e4a26', bg0: '#120806', bg1: '#20100a' },
  },
]

export function isJobId(v: string | null): v is JobId {
  return v !== null && JOBS.some((j) => j.id === v)
}
```

- [ ] **Step 4: Run the selfcheck, verify it passes**

Run: `node src/content/jobs.selfcheck.ts`
Expected: `jobs selfcheck passed`

- [ ] **Step 5: Commit**

```bash
git add src/content/jobs.ts src/content/jobs.selfcheck.ts
git commit -m "Add the four-job table with node selfcheck

Palette anchors: physicist/swe reuse the site's existing teal/amber;
ai-systems violet and robotics ember extend it, matched to the v3
portrait set. Taglines trace to experience.md."
```

---

### Task 2: Portrait assets

**Files:**
- Create: `src/assets/portraits/base.jpg`, `physicist.jpg`, `ai-systems.jpg`, `swe.jpg`, `robotics.jpg`

**Interfaces:**
- Produces: five JPEGs at native 1086x1448, quality 85, imported by Task 4 as `../assets/portraits/<id>.jpg`.

- [ ] **Step 1: Convert the private v3 PNGs to shippable JPEGs**

```bash
mkdir -p src/assets/portraits
P=~/Documents/personal/portfolio-assets/portrait/v3
sips -s format jpeg -s formatOptions 85 "$P/base-portrait.png" --out src/assets/portraits/base.jpg
sips -s format jpeg -s formatOptions 85 "$P/physicist.png"     --out src/assets/portraits/physicist.jpg
sips -s format jpeg -s formatOptions 85 "$P/ai-systems.png"    --out src/assets/portraits/ai-systems.jpg
sips -s format jpeg -s formatOptions 85 "$P/swe.png"           --out src/assets/portraits/swe.jpg
sips -s format jpeg -s formatOptions 85 "$P/robotics.png"      --out src/assets/portraits/robotics.jpg
```

- [ ] **Step 2: Verify sizes are sane (each well under 400 kB)**

Run: `ls -la src/assets/portraits/`
Expected: five .jpg files, roughly 150-350 kB each. If any exceeds 400 kB, re-run that file with `-s formatOptions 75`.

- [ ] **Step 3: Commit**

```bash
git add src/assets/portraits
git commit -m "Add the five painted job portraits (v3 set, JPEG q85)

Native 1086x1448 from the private asset repo; AVIF/upscale pass is
phase-5 work. These ship publicly by design."
```

---

### Task 3: Theme tokens and the job state machine

**Files:**
- Modify: `src/index.css` (append token blocks; do not touch existing rules)
- Rewrite: `src/App.tsx`

**Interfaces:**
- Consumes: `JOBS`, `isJobId`, `JobId` from Task 1.
- Produces: `data-job` attribute on `<html>` (`'' | JobId`); CSS vars `--accent`, `--accent-dim`, `--bg0`, `--bg1` that Tasks 4-5 style against; `App` renders `<CharacterSelect onEquip remembered />` when no job and `<Panels job />` always (inert while gated). Task 4 must export `CharacterSelect({ onEquip: (id: JobId) => void, remembered: JobId | null })`; Task 5 must export `Panels({ job }: { job: JobId | null })`.

- [ ] **Step 1: Append the theme token blocks to `src/index.css`**

```css
/* ---- character-select theming (phase 1) ------------------------------- */
/* Base tokens mirror the existing abyssal palette so ungated/default
   renders match the site's established look. */
:root {
  --accent: #4fd8c8;
  --accent-dim: #1e6f8f;
  --bg0: #0b0a12;
  --bg1: #14121e;
}
:root[data-job='physicist'] { --accent: #4fd8c8; --accent-dim: #1e6f8f; --bg0: #061018; --bg1: #0a1c28; }
:root[data-job='ai-systems'] { --accent: #b48cff; --accent-dim: #6b4a9e; --bg0: #0d0a1a; --bg1: #161028; }
:root[data-job='swe'] { --accent: #f0a848; --accent-dim: #9a6a2a; --bg0: #120e08; --bg1: #1e1810; }
:root[data-job='robotics'] { --accent: #ff7a45; --accent-dim: #9e4a26; --bg0: #120806; --bg1: #20100a; }

/* Placeholder world: a themed gradient until the phase-3 zones land. */
.world-placeholder {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: radial-gradient(120% 90% at 50% 10%, var(--bg1) 0%, var(--bg0) 70%);
  transition: background 0.6s ease;
}
@media (prefers-reduced-motion: reduce) {
  .world-placeholder { transition: none; }
}
```

- [ ] **Step 2: Rewrite `src/App.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { CharacterSelect } from './ui/CharacterSelect'
import { Panels } from './ui/Panels'
import { StaticFallback } from './ui/Sections'
import { isJobId, type JobId } from './content/jobs'

// Full-gate model per the redesign spec: the select screen always shows
// first; the last-played job is only pre-highlighted, never auto-equipped.
// ?plain=1 is the ungated plain-text path (recruiter hatch, a11y, no-WebGL
// once zones land in phase 3).

function rememberedJob(): JobId | null {
  try {
    const v = localStorage.getItem('job')
    return isJobId(v) ? v : null
  } catch {
    return null
  }
}

export default function App() {
  const [job, setJob] = useState<JobId | null>(null)

  useEffect(() => {
    document.documentElement.dataset.job = job ?? ''
  }, [job])

  if (new URLSearchParams(location.search).has('plain')) return <StaticFallback />

  const equip = (id: JobId) => {
    try {
      localStorage.setItem('job', id)
    } catch {
      /* private mode: remembering is best-effort */
    }
    setJob(id)
  }

  return (
    <>
      <div className="world-placeholder" aria-hidden="true" />
      {job === null && <CharacterSelect onEquip={equip} remembered={rememberedJob()} />}
      <Panels job={job} />
    </>
  )
}
```

Note: the Canvas/three imports leave App on this branch. `src/three/*` and `src/ui/Sections.tsx`'s `Sections` stay on disk untouched — the frozen-deep zone reconnects them in phase 3.

- [ ] **Step 3: Typecheck-only sanity (components don't exist yet)**

Run: `npx tsc -b 2>&1 | head -5`
Expected: FAIL — cannot find `./ui/CharacterSelect` and `./ui/Panels`. That's the Task 4/5 contract; do not commit yet.

---

### Task 4: The character-select gate

**Files:**
- Create: `src/ui/CharacterSelect.tsx`
- Modify: `src/index.css` (append select-screen styles)

**Interfaces:**
- Consumes: `JOBS`, `Job`, `JobId` (Task 1); portrait JPEGs (Task 2); CSS vars (Task 3).
- Produces: `export function CharacterSelect({ onEquip, remembered }: { onEquip: (id: JobId) => void; remembered: JobId | null })`.

- [ ] **Step 1: Write the component**

`src/ui/CharacterSelect.tsx`:
```tsx
import { useState } from 'react'
import { JOBS, type JobId } from '../content/jobs'
import { identity } from '../content/data'
import base from '../assets/portraits/base.jpg'
import physicist from '../assets/portraits/physicist.jpg'
import aiSystems from '../assets/portraits/ai-systems.jpg'
import swe from '../assets/portraits/swe.jpg'
import robotics from '../assets/portraits/robotics.jpg'

const PORTRAITS: Record<'base' | JobId, string> = {
  base,
  physicist,
  'ai-systems': aiSystems,
  swe,
  robotics,
}

export function CharacterSelect({
  onEquip,
  remembered,
}: {
  onEquip: (id: JobId) => void
  remembered: JobId | null
}) {
  // Hover/focus previews a job: portrait crossfades, tokens re-light.
  const [preview, setPreview] = useState<JobId | null>(remembered)
  const active = preview ?? 'base'
  const previewJob = JOBS.find((j) => j.id === preview)

  return (
    <div className="select-screen" data-preview={active}>
      <div className="select-stage">
        <div className="select-portraits" aria-hidden={preview !== null ? undefined : true}>
          {(Object.keys(PORTRAITS) as Array<'base' | JobId>).map((k) => (
            <img
              key={k}
              src={PORTRAITS[k]}
              alt={k === active ? 'Painted portrait of Andry Paez' : ''}
              className={k === active ? 'active' : ''}
              draggable={false}
            />
          ))}
        </div>
        <p className="eyebrow">character select</p>
        <h1 className="nameplate">{identity.name}</h1>
        <p className="select-tagline">{previewJob ? previewJob.tagline : identity.tagline}</p>
        <div className="job-cards">
          {JOBS.map((j) => (
            <button
              key={j.id}
              type="button"
              className={`job-card${j.id === remembered ? ' remembered' : ''}`}
              autoFocus={j.id === (remembered ?? JOBS[0].id)}
              onMouseEnter={() => setPreview(j.id)}
              onFocus={() => setPreview(j.id)}
              onClick={() => onEquip(j.id)}
            >
              <span className="job-name">{j.name}</span>
              <span className="job-subtitle">{j.subtitle}</span>
              <span className="job-level" aria-label={j.level === 1 ? 'currently leveling' : `level ${j.level} of 4`}>
                {Array.from({ length: 4 }, (_, i) => (
                  <i key={i} className={i < j.level ? 'pip on' : 'pip'} />
                ))}
                {j.level === 1 && <em className="leveling">currently leveling</em>}
              </span>
            </button>
          ))}
        </div>
        <a className="plain-link" href="?plain=1">
          view the plain-text version
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Append select-screen styles to `src/index.css`**

```css
/* ---- select screen ----------------------------------------------------- */
.select-screen {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  background: radial-gradient(120% 90% at 50% 10%, var(--bg1) 0%, var(--bg0) 72%);
  transition: background 0.4s ease;
  overflow-y: auto;
}
.select-stage {
  display: grid;
  justify-items: center;
  gap: 0.9rem;
  padding: 3rem 1.25rem 4rem;
  max-width: 60rem;
  text-align: center;
}
.select-portraits {
  position: relative;
  width: min(38vh, 17rem);
  aspect-ratio: 3 / 4;
}
.select-portraits img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  box-shadow: 0 0 42px color-mix(in srgb, var(--accent) 28%, transparent);
  opacity: 0;
  transition: opacity 0.35s ease;
}
.select-portraits img.active { opacity: 1; }
.nameplate { font-size: clamp(1.8rem, 4vw, 2.6rem); margin: 0; }
.select-tagline { max-width: 34rem; color: var(--muted); margin: 0; }
.job-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(9.5rem, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}
.job-card {
  font: inherit;
  text-align: left;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: 0.3rem;
  padding: 0.9rem 1rem 0.8rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255 255 255 / 0.14);
  background: rgba(10 10 18 / 0.55);
  backdrop-filter: blur(6px);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.job-card:hover,
.job-card:focus-visible {
  border-color: var(--accent);
  box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 30%, transparent);
  transform: translateY(-2px);
  outline: none;
}
.job-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.job-card.remembered::after { content: 'last played'; font-size: 0.65rem; color: var(--muted); }
.job-name { font-weight: 500; }
.job-subtitle { font-style: italic; font-size: 0.85rem; color: var(--muted); }
.job-level { display: flex; align-items: center; gap: 0.25rem; margin-top: 0.15rem; }
.job-level .pip {
  width: 0.5rem; height: 0.5rem; border-radius: 50%;
  background: rgba(255 255 255 / 0.15);
}
.job-level .pip.on { background: var(--accent); }
.job-level .leveling { font-size: 0.65rem; color: var(--muted); font-style: normal; margin-left: 0.3rem; }
.plain-link { color: var(--muted); font-size: 0.85rem; margin-top: 1.25rem; }
@media (max-width: 760px) {
  .job-cards { grid-template-columns: repeat(2, 1fr); }
}
@media (prefers-reduced-motion: reduce) {
  .select-screen, .select-portraits img, .job-card { transition: none; }
}
```

Note: `--muted` already exists in the site's CSS (#bfb6d8, lifted in PR #7); reuse it, do not redefine.

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b 2>&1 | head -5`
Expected: FAIL only on `./ui/Panels` (Task 5). No errors in CharacterSelect.

- [ ] **Step 4: Commit**

```bash
git add src/ui/CharacterSelect.tsx src/index.css
git commit -m "Build the character-select gate

Full-gate per spec: portrait crossfade + token re-light on hover/focus,
honest level pips (robotics wears 'currently leveling'), last-played
pre-highlight via autoFocus, plain-text hatch link. No 3D; the gate is
DOM so it renders before any zone loads."
```

---

### Task 5: Panel skeleton

**Files:**
- Create: `src/ui/Panels.tsx`
- Modify: `src/index.css` (append panel styles)

**Interfaces:**
- Consumes: `JobId`, `JOBS` (Task 1); `identity`, `research`, `projects`, `howIWork`, `footer`, `ContactLinks`, `ProjectCard` (existing); CSS vars (Task 3).
- Produces: `export function Panels({ job }: { job: JobId | null })` — inert + visually hidden while `job === null`.

- [ ] **Step 1: Write the component**

`src/ui/Panels.tsx`:
```tsx
import { JOBS, type JobId } from '../content/jobs'
import { identity, research, projects, howIWork, footer } from '../content/data'
import { ContactLinks, ProjectCard } from './Sections'

// The shared skeleton all four jobs render through. Phase 1 fills the
// panels that already have audited copy (hero, research, quest board,
// contact); quest log / skill tree / achievements are honest
// under-construction shells until phase 2.
export function Panels({ job }: { job: JobId | null }) {
  const equipped = JOBS.find((j) => j.id === job)
  return (
    <main className="panels" inert={job === null || undefined}>
      <section className="game-panel hero-panel">
        <p className="eyebrow">{equipped ? `${equipped.name} · ${equipped.subtitle}` : 'Andry Paez'}</p>
        <h2>{equipped ? equipped.tagline : identity.tagline}</h2>
        <ContactLinks />
      </section>

      <section className="game-panel">
        <p className="eyebrow">{research.eyebrow}</p>
        <h2>{research.title}</h2>
        <p>{research.body}</p>
        <ul>
          {research.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <section className="game-panel shell">
        <p className="eyebrow">quest log</p>
        <h2>The route here was not a straight line</h2>
        <p className="under-construction">This panel opens in a coming patch.</p>
      </section>

      <section className="game-panel">
        <p className="eyebrow">quest board</p>
        <h2>Projects</h2>
        <div className="quest-board">
          {projects.map((p) => (
            <ProjectCard key={p.name} p={p} />
          ))}
        </div>
      </section>

      <section className="game-panel shell">
        <p className="eyebrow">skill tree</p>
        <h2>One character, four branches</h2>
        <p className="under-construction">This panel opens in a coming patch.</p>
      </section>

      <section className="game-panel shell">
        <p className="eyebrow">achievements</p>
        <h2>Records</h2>
        <p className="under-construction">This panel opens in a coming patch.</p>
      </section>

      <section className="game-panel">
        <p className="eyebrow">{howIWork.eyebrow}</p>
        <h2>{howIWork.title}</h2>
        <p>{howIWork.body}</p>
        <p className="open-to">{footer.line}</p>
        <ContactLinks />
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Append panel styles to `src/index.css`**

```css
/* ---- panel skeleton ---------------------------------------------------- */
.panels {
  display: grid;
  gap: 4.5rem;
  max-width: 62rem;
  margin: 0 auto;
  padding: 5rem 1.25rem 7rem;
}
.panels[inert] { visibility: hidden; }
.game-panel {
  border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--bg1) 78%, transparent);
  backdrop-filter: blur(8px);
  padding: 2rem 2.2rem;
  box-shadow: 0 0 30px color-mix(in srgb, var(--accent) 8%, transparent);
}
.game-panel.shell { opacity: 0.75; }
.under-construction { color: var(--muted); font-style: italic; }
.quest-board { display: grid; gap: 1.25rem; grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr)); }
```

- [ ] **Step 3: Full typecheck and build**

Run: `npm run build`
Expected: clean (tsc + vite). If `inert` typing complains under React 19 types, use `inert={job === null ? true : undefined}` — React 19 supports the boolean attribute natively.

- [ ] **Step 4: Run both selfchecks**

Run: `node src/content/jobs.selfcheck.ts && node src/sim/gpe.selfcheck.ts`
Expected: `jobs selfcheck passed` and the gpe selfcheck's normal pass output.

- [ ] **Step 5: Commit (App rewrite from Task 3 lands here too — first green state)**

```bash
git add src/App.tsx src/ui/Panels.tsx src/index.css
git commit -m "Wire the job state machine and shared panel skeleton

App: full gate -> equip -> themed shell; ?plain=1 renders the ungated
StaticFallback; data-job on <html> drives the token blocks. Panels
render real DOM under the gate (inert while gated) so content exists
pre-selection; quest log / skill tree / achievements are honest
under-construction shells until phase 2. Canvas/three leave App on this
branch; the frozen-deep zone reconnects them in phase 3."
```

---

### Task 6: AGENTS.md guardrail update

**Files:**
- Modify: `AGENTS.md` (Guardrails section + "What this is" intro)

- [ ] **Step 1: Update the intro paragraph**

In the "What this is" section, replace the sentence describing the site:

Old: `A 3D scroll-journey (Vite + TypeScript + React + @react-three/fiber + drei) whose centerpiece is a live 1D spin-1/2 Gross-Pitaevskii simulation rendered as a spacetime terrain.`

New: `A character-select portfolio (Vite + TypeScript + React; @react-three/fiber for the job worlds): one character, four jobs, each job re-theming the site and carrying its own world. The live 1D spin-1/2 Gross-Pitaevskii simulation remains the Physicist world's centerpiece. Redesign spec: docs/superpowers/specs/2026-07-02-character-select-redesign-design.md (in progress on the redesign/character-select branch; main still serves the journey site, tagged journey-v1).`

- [ ] **Step 2: Update the second guardrail bullet**

Old bullet begins: `The sim is the site's only 3D set piece. Per-scene set pieces (#2) were built, reviewed on-page, and rejected`

New bullet: `One set piece per view: each job's world is that job's single set piece; panels and the chat terminal are chrome, never rivals. The pre-redesign lesson stands: per-scene set pieces beside a centerpiece (#2, PR #12) were built, reviewed, and rejected. Worlds must be real data, real math, or a labeled true-fact metaphor per the redesign spec; no decorative cosplay.`

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "Update guardrails for the character-select era (per spec phase 1)"
```

---

### Task 7: Visual verification pass

**Files:** none (verification only; fixes found here get their own commits)

- [ ] **Step 1: Build + selfchecks green**

Run: `npm run build && node src/content/jobs.selfcheck.ts && node src/sim/gpe.selfcheck.ts`
Expected: all pass.

- [ ] **Step 2: Drive the real page (Playwright MCP, per AGENTS.md machine notes)**

`npm run dev`, then verify each of these against the running page:

1. Select screen renders: portrait, nameplate, four cards in spec order, plain-text link. Screenshot desktop 1440x900.
2. Hover/focus each card: portrait crossfades, glow/token color changes per job (check `getComputedStyle(document.documentElement).getPropertyValue('--accent')` changes after click).
3. Click Physicist: gate dismisses, panels visible, `<html data-job="physicist">`, localStorage `job=physicist`. Reload: gate shows again with Physicist card focused (`.remembered` present).
4. Keyboard only: Tab reaches cards, focus ring visible, Enter equips. Tab reaches the plain link.
5. `?plain=1`: full StaticFallback content, no gate, all copy present in innerText.
6. Reduced motion (`page.emulateMedia({ reducedMotion: 'reduce' })`): no crossfade/transform transitions (spot-check computed `transition` is `none`), everything still functional.
7. Mobile 390x844: cards fall to 2-column, no horizontal scroll, portrait fits.
8. Console: no errors (the known #16 dev double-createRoot warning is pre-existing and allowed).

- [ ] **Step 3: Update the session ledger memory and push the branch**

```bash
git push
```

Then record in `planned-portfolio-and-gh-readme.md`: phase 1 shipped on the branch, what's verified, what phase 2 needs.

---

## Self-review notes

- Spec coverage: gate ✓ (Task 4), tokens/re-theme ✓ (Task 3), skeleton ✓ (Task 5), plain hatch ✓ (Tasks 3/4), honest levels ✓ (Tasks 1/4), AGENTS.md ✓ (Task 6), a11y floor ✓ (Tasks 4/5/7). Worlds, terminal, quest-log content, resume wiring: later phases by design.
- The Task 3 App rewrite intentionally does not compile until Tasks 4-5 exist; its commit lands with Task 5 (noted in both tasks).
- `color-mix` and `inert` are modern-browser features; acceptable for this audience (same stance as backdrop-filter already in the site). The plain-text path works everywhere regardless.
