# Character-select site redesign (direction lock)

Date: 2026-07-02
Status: approved direction — spec only, no implementation yet. Supersedes the
"sim is the sole centerpiece" framing from the 3D-journey era: Andry called the
site bland next to the portfolios he studied, and visitors kept asking "what is
that / what is it doing" about the terrain. This spec locks the new direction;
implementation is phased across later sessions.

## Problem

The current site is a competent 3D scroll journey, but its one set piece (the
GPE spacetime terrain) is illegible to visitors — time-as-a-space-axis is a
physicist's idiom, so the "doing" of the sim is invisible. Meanwhile the rest
of the site reads as generic sections floating over a backdrop. Andry wants a
drastic, maximally creative direction that blends who he actually is: physics
researcher, terminal-native (Hyprland/Kitty/LazyVim), and someone who grew up
in MMORPGs (GW2, FFXIV). Audience: employers and engineers.

## Research (2026-07-02, web survey)

- The emmabostian/developer-portfolios list has decayed into ~1,800 crowd-PR'd
  entries; the useful references are the community-celebrated set: Bruno Simon
  (one conceit IS the site), Brittany Chiang (the clean archetype), Cassie
  Evans (illustration as brand), Charlie Gerard (project selection as the
  differentiator), Rauno Freiberg / Emil Kowalski (restraint as seniority).
- Terminal portfolios are a cliché genre (fake `whoami`, `sudo hire-me`,
  figlet banners, hundreds of forks of one template). The ones that transcend
  it use real data — commands that run real things — and performance as thesis.
- Patterns that separate memorable from bland: one conceit carried all the way
  through (never a grab-bag of effects); the hook lands in 3 seconds without
  instructions; personality in microcopy, not a "fun" section; a real
  skimmable DOM under any gimmick (the 6-second recruiter scan); one honest
  photo beats a gallery; perf and correctness are part of the credibility.

## The conceit

The site is an MMO character screen. One character (Andry), four jobs — the
FFXIV job-switch model, not four separate people. Physics is the world,
the terminal is the chat box, the MMO is the UI system, and the interests are
the content.

## Design

### Entry: full character-select gate

Fast dark load: drawn 2D portrait center-stage, nameplate, four job cards
(emblem, literal job name, flavor subtitle, honest level). Hovering a card
re-lights the portrait and background in that job's palette; selecting plays a
sub-second, skippable equip transition, and the site composes itself in that
theme. The last-played job is remembered (localStorage) and pre-highlighted;
Enter re-enters instantly. One quiet line at the bottom — "view the plain-text
version" — is the recruiter escape hatch, the no-WebGL path, and the a11y path
in one link. The gate exists because that link does; it is non-negotiable.

Portrait: AI-edited drawn art from a real photo (MMO precedent — FFXIV job art
and GW2 loading screens are painted, not 3D). One base + four job palette
variants. The slot is format-agnostic so a 3D bust could drop in someday; a
Blender-modeled avatar was considered and rejected (character art is the least
forgiving 3D discipline and would gate the redesign behind learning it).

### Job roster (honest levels)

| Job | Flavor | Level | Front-loads |
|---|---|---|---|
| Physicist | the Scholar | high | BEC/GPE research with Dr. Hurst, the live sim, the Ising model project |
| AI Systems Engineer | the Summoner | high | agents, local inference, MCP, Jetson, daily-hub |
| Research SWE | the Artificer | mid-high | this site itself, dashboards, tooling, the selfcheck discipline |
| Roboticist | the Automaton | low — "currently leveling" | Jetson edge work, Reachy interest, where he's headed |

Levels are honest by design: a low-level Roboticist card is the MMO-native way
to say "aspiring, not inflated," matching the no-inflated-titles rule. Literal
job names lead; flavor lives in the subtitle so employers parse instantly.

### Full re-theme per job

Switching jobs changes: palette/accent, portrait variant, hero tagline, the
background world, section emphasis, and project ordering. Switching is
available anytime from the nameplate (and via `job <name>` in the terminal),
never a one-way door.

### Four worlds — fantasy where he researches, real where he's hired

Each world is one R3F scene behind the shared panel skeleton. Worlds never
carry body text. Every world is real data or real math, or a labeled metaphor
derived from a true fact — no decorative cosplay.

1. **Physicist → the frozen deep (fantasy).** A crystalline ice cavern — a BEC
   is the coldest place in the universe — with the REAL live GPE simulation
   rendered as the aurora rippling through the ice. The honest-physics
   guardrail is untouched: the solver stays a real Gross-Pitaevskii sim with
   its node-runnable selfcheck, and the caption adjusts to the new staging.
   The parked sim-variation plan (per-visit seed, varied quench parameters,
   ?seed= reproducibility, weak-corner selfcheck) ships as part of this world.
2. **AI Systems → the summoner's sanctum (fantasy).** An arcane circle where
   familiars are summoned and dispatched — which is literally what agent
   orchestration is. The real model names (qwen3.5:9b, glm-4.7-flash, …)
   appear on the sigils.
3. **Research SWE → the dev room (real).** A stylized diorama of the actual
   battlestation: PC tower, monitors textured with the real rice, LazyVim
   open. One fully-real zone inoculates the site against "it's all cosplay."
4. **Roboticist → the workbench (mix).** The real hardware he owns — Jetson
   Orin Nano and the Reachy Mini Lite it hosts — on the bench, plus an
   articulated element running real inverse kinematics, blueprints, foundry
   glow — visibly under construction, which is true of the job.

Zones ship staged, MMO-style: Physicist first (the sim and its five PRs of
polish carry over), the others open "patch by patch" with an honest "zone
opens soon" state on their cards until each lands.

### Shared panel skeleton (all jobs)

Dark-glass game panels over the world; theme, ordering, and emphasis change
per job, the skeleton never does. About → Quest log → Quest board → Skill
tree → Achievements → Contact.

- **Quest log** (experience/education): Cal Poly → gap → MJC → SJSU → RA as a
  completed quest chain; the gap rendered honestly (one line of "time away"
  microcopy at most).
- **Quest board** (projects): cards with real UI screenshots, tagged by job;
  the equipped job's cards sort first and glow. Private projects stay
  unlinked, "ask me about it," per content rules.
- **Skill tree**: one tree, four branches (the four jobs); the equipped
  branch is lit. This replaces any rotating-cloud-style skill widget.
- **Achievements**: Dean's Scholar, the four MJC honors degrees, hackathon,
  certificates — an understated trophy grid.
- **Contact** (new): party-invite panel — email, LinkedIn, GitHub, resume PDF.

### Chat terminal

A persistent MMO chat box (bottom-left, collapsed by default on mobile),
theme-tinted, and a REAL shell, not cosplay: `ls projects`, `cat research.md`,
`job physicist` (switches job), `/selfcheck` (runs the actual GPE selfcheck
in-browser), `help`. Small command set; every command is backed by real data.
Game chat windows literally are terminals — this is the terminal-life blend.

### Floor (non-negotiable)

Real DOM text everywhere; prefers-reduced-motion gets static themed frames
(no equip animation, no world motion — themes still switch); the plain-text
version carries ALL content ungated and is the SEO/crawl path; visible focus
states; performance is part of the aesthetic (dpr-2 retina profiling, dpr-1
aliasing checks, per AGENTS.md machine notes).

### Copy rules

Per-job hero taglines and section intros are the only new copy (4 × ~3 short
blocks). All facts stay traceable to experience.md; the Kibble-Zurek bullet
stays off pending Dr. Hurst; the voice stays Andry's (direct, understated, no
em dashes, no filler).

## Rejected alternatives

- **B "The Rice"** (site as the Hyprland desktop: boot entry, tiled panes,
  neofetch card, sim as a running job). Strong authenticity, but A is the
  clever blend Andry described, and the terminal survives inside A as the
  chat box.
- **C "Clean + command layer"** (Brittany-Chiang-class site plus a command
  palette). Safest, but not the drastic change asked for.
- **Round-one world concepts** (agent-graph constellation, GitHub commit-graph
  world, bare IK arm): rejected by Andry as worlds — they were data
  visualizations, not places. The zone framing replaced them; the real-data
  DNA survives inside the zones (sigil names, rice textures, real IK).
- **Blender 3D avatar**: rejected (see Entry).
- **Rotating skill cloud** (from a reference portfolio Andry liked): the
  desire is right — skills as a playful object — the widget is a
  junior-portfolio cliché. The skill tree is that desire done properly.

## Risks and mitigations

- **Kitsch for non-gamer recruiters** → literal job names lead on cards; glass
  panels stay elegant (no HP bars, no loading screens); the plain-text hatch
  is one click and carries everything.
- **Grab-bag incoherence across four worlds** → one shared panel skeleton, one
  glass design language, one metaphor rule (real data / real math / labeled
  true-fact metaphor), zones differ inside that frame.
- **Scope blowout (4 themes × contrast × a11y)** → staged shipping, one zone
  per PR arc, ×4 verification budgeted as its own phase, "zone opens soon" is
  an honest intermediate state.
- **Content thinness across four jobs** → one character model: facts are
  shared, only emphasis and ~3 short blocks per job are new.

## Asset dependencies (Andry provides; blocks phase 2+, not phase 1)

1. Portrait photo, high-res, + AI-drawn variants (base + four job palettes).
2. Project UI screenshots from projects that have UIs: reachy-console (web
   control console), Sage (Tauri app), Kalshi (Streamlit dashboard).
   daily-hub has no UI yet — add when one lands. (API cost dashboard was
   never implemented — per experience.md and project-status.md — and appears
   nowhere; the CUDA GEMM project likewise stays off per the standing rule.)
3. Certificates/awards list or scans (Dean's Scholar, four MJC degrees, hackathon).
4. Rice screenshot (dev-room monitor textures), physical photos of the Jetson
   and Reachy Mini (workbench-zone modeling reference; no PC photo needed),
   GW2/FFXIV flavor references, judo/lifting one-liners for microcopy.
5. Contact channels to list + whether to include a resume PDF download.

## Phasing (multi-PR, later sessions)

1. Theming tokens + character-select screen + shared panel skeleton. This
   phase also updates the AGENTS.md guardrails: "the sim is the site's only 3D
   set piece" becomes "each job's world is its single set piece, per this
   spec"; honest-physics and the accessibility floor carry over unchanged.
2. Sections/panels on the new skeleton (quest log, quest board, skill tree,
   achievements, contact).
3. Worlds one by one — Physicist (frozen deep) first, absorbing the parked
   sim-variation plan; then sanctum, dev room, workbench.
4. Chat terminal.
5. Content pass + the ×4 contrast/reduced-motion/fallback/perf verification.

Each phase is issue-driven with its own PR(s) per AGENTS.md workflow. The
umbrella issue for this direction tracks the phase checklist.
