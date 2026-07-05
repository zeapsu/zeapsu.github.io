// All site copy lives here so it can be audited line-by-line against
// ~/Documents/personal/experience.md. Do not add claims that are not in that file.
import type { JobId } from './jobs'
import sageShot from '../assets/screenshots/sage.jpg'
import kalshiShot from '../assets/screenshots/kalshi.jpg'
import reachyConsoleShot from '../assets/screenshots/reachy-console.jpg'
import reachyPhoto from '../assets/hardware/reachy.jpg'
import jetsonPhoto from '../assets/hardware/jetson.jpg'

export const identity = {
  name: 'Andry Paez',
  tagline: 'Physics grad who likes building AI systems on hardware I can point at.',
  email: 'andryypaez@gmail.com',
  github: 'https://github.com/zeapsu',
  linkedin: 'https://www.linkedin.com/in/andry-lloyd-paez-744883252',
  simCaption:
    'This is a live two-component Gross-Pitaevskii simulation, the same equations I work on at SJSU. Scroll and watch spin domains form.',
  auroraCaption:
    'The aurora is a live two-component Gross-Pitaevskii simulation, the same equations I work on at SJSU. Each band is a spin domain forming in real time.',
}

export const research = {
  eyebrow: 'research',
  title: 'Simulating ultracold atoms at San Jose State',
  body: 'Research assistant in the Dept. of Physics & Astronomy, working on spinor Bose-Einstein condensate simulations with Dr. Hilary Hurst. I build the code that keeps the science running: a CLI and HDF5 pipeline for ground states and Bogoliubov-de Gennes spectra, reproducible environments, and Slurm workflows on the SJSU cluster.',
  facts: [
    'Vectorized the sine-DVR kinetic-energy operator: 161 s down to 0.09 s at 2048 grid points, a 1,880x speedup verified bit-exact by a benchmark harness',
    'Validated spinor ground states to machine precision (norm error 2.2e-16) with correct miscible and immiscible domain-wall structure',
    'Hash-addressed initial-condition catalog with a rebuildable SQLite index and a write-then-index HPC workflow that avoids concurrent-writer contention',
    'Ran a c2-quench study of spontaneous symmetry breaking with Truncated Wigner vacuum-noise seeding and domain-wall counting, recovering Kibble-Zurek scaling (exponent 1/4)',
    'Around 13 dated technical reports so far: benchmarks, validations, design recommendations',
  ],
}

export interface Project {
  name: string
  status: string
  blurb: string
  facts: string[]
  link?: string
  // A real UI screenshot of the shipped project (private projects show their
  // UI only; the "ask me about it" caveat stays in `status`).
  image?: string
  imageAlt?: string
}

export const projects: Project[] = [
  {
    name: 'reachy-console',
    status: 'private, ask me about it',
    blurb: 'Control console and voice assistant for a Reachy Mini robot living on a headless Jetson Orin Nano.',
    facts: [
      'FastAPI + vanilla JS web console, a pure HTTP/WS proxy that never grabs the robot lock; 162 controller tests green',
      'Voice pipeline: mic to faster-whisper to LLM to TTS, with live camera frames for visual questions; 286 tests',
      'Real hardware debugging: built webrtcsink from source for arm64, root-caused speaker silence to ALSA card remapping after an OS migration',
    ],
    image: reachyConsoleShot,
    imageAlt: 'The reachy-console web UI: live camera feed and robot controls.',
  },
  {
    name: 'Kalshi weather markets',
    status: 'private, honest caveat: no validated P&L',
    blurb: 'An end-to-end quantitative ML system for trading weather prediction markets. Not a profitable bot, and I say so.',
    facts: [
      'NWS and commercial forecast ingestion, a Gaussian edge model, and stacked LSTM temperature models in PyTorch with per-city artifacts',
      'A 1,336-line trading engine with bracket parsing and ASOS rounding compensation, plus a Streamlit dashboard',
    ],
    image: kalshiShot,
    imageAlt: 'The Kalshi weather-markets dashboard: market overview.',
  },
  {
    name: 'Sage',
    status: 'paused on purpose',
    blurb: 'Local-first desktop knowledge agent: add sources, chat with citations, generate quizzes and audio narration.',
    facts: [
      'Tauri + Next.js + FastAPI + SQLite with embeddings; provider abstraction across OpenAI, Anthropic, DeepSeek, Ollama',
      '130 commits over 15 months, then a documented strategic pause with written market rationale. The kill decision is in the repo.',
    ],
    link: 'https://github.com/zeapsu/Sage',
    image: sageShot,
    imageAlt: 'The Sage desktop app home screen: the Tome chat prompt and skill actions (Sources, Report, Quiz, Flashcards, Audio, Chat).',
  },
  {
    name: 'daily-hub',
    status: 'private, active',
    blurb: 'Static-site generator for a daily opportunity hub, built around a strict public/private boundary.',
    facts: [
      'Whitelist-only renderer plus a CI leak check that fails the build if private tokens ever reach public output',
      'Stdlib RSS ingestion hardened against XXE, redirects, and oversize responses; test suite grew 37 to 116 across three increments',
    ],
  },
  {
    name: 'Quantum computing work',
    status: 'WISER program + coursework',
    blurb: 'QAOA portfolio optimization and quantum error correction on real hardware.',
    facts: [
      'QAOA as a new ansatz family benchmarked against CPLEX on a 31-bond portfolio: 0.02% median objective gap after local search',
      "Shor's 9-qubit code run on IBM hardware via Qiskit Runtime, measuring a 36% fidelity improvement",
    ],
    link: 'https://github.com/zeapsu/Quantum-Portfolio-Optimization',
  },
]

// Quest log: education + work as a completed quest chain. The pre-2021
// years are rendered as one honest "time away" line — the Cal Poly stint is
// on experience.md's exclusions list, so it is named nowhere on the site.
export const questLog = {
  eyebrow: 'quest log',
  title: 'The route here was not a straight line',
  intro: 'Community college to a physics degree to a research lab. Every step below is a finished quest.',
  quests: [
    {
      period: 'before 2021',
      title: 'The long way round',
      detail: 'A few years finding the way to community college and physics.',
      status: 'done' as const,
    },
    {
      period: '2021 – 2024',
      title: 'Modesto Junior College',
      detail:
        'Four transfer degrees, all with honors: Computer Science, Mathematics, Physics, and Language & Rationality. President’s List five times, GPA 3.73.',
      status: 'done' as const,
    },
    {
      period: '2024 – 2026',
      title: 'San Jose State University',
      detail:
        'B.S. Physics, GPA 3.80, Dean’s Scholar. Quantum mechanics, quantum information science, and computational methods.',
      status: 'done' as const,
    },
    {
      period: '2026 – present',
      title: 'Research Assistant, SJSU Physics',
      detail:
        'Spinor Bose-Einstein condensate simulations with Dr. Hilary Hurst. The current quest.',
      status: 'active' as const,
    },
  ],
}

// Skill tree: one tree, four branches (the four jobs). The equipped branch
// lights. Every skill traces to experience.md's skills/projects sections.
export const skillTree: { job: JobId; branch: string; skills: string[] }[] = [
  {
    job: 'physicist',
    branch: 'Physicist',
    skills: [
      'Quantum information: Qiskit, QAOA, Shor-code error correction',
      'Computational physics: NumPy, FFT/spectral methods, Monte Carlo',
      'Condensate simulation: Gross-Pitaevskii, HDF5, Slurm/HPC',
    ],
  },
  {
    job: 'ai-systems',
    branch: 'AI Systems',
    skills: [
      'Local inference: llama.cpp, Ollama, quantization-aware selection',
      'Agents: ReAct tool loops, MCP, multi-agent review gates',
      'Edge deployment: Jetson Orin Nano, faster-whisper',
    ],
  },
  {
    job: 'swe',
    branch: 'Research SWE',
    skills: [
      'Python, TypeScript, Rust (Tauri), C/C++',
      'FastAPI, Next.js/React, WebSockets/SSE',
      'CI, pytest, Playwright-driven runtime verification',
    ],
  },
  {
    job: 'robotics',
    branch: 'Roboticist',
    skills: [
      'A Reachy Mini living on a headless Jetson',
      'GStreamer, ALSA/PipeWire, kernel-driver debugging',
      'ESP32 firmware (currently leveling)',
    ],
  },
]

// Achievements: understated trophy grid. Degrees/honors from the education
// section, certificates from the certificates section of experience.md.
// `credential` links the actual scan (public/certificates/) for the ones that
// have a real document behind them; the trophy becomes clickable when set.
export interface Achievement {
  title: string
  detail: string
  credential?: string
}

export const achievements: Achievement[] = [
  { title: 'Dean’s Scholar', detail: 'SJSU, Fall 2024 and Fall 2025' },
  { title: 'Four degrees with honors', detail: 'MJC: CS, Mathematics, Physics, Language & Rationality' },
  { title: 'President’s List × 5', detail: 'Modesto Junior College' },
  {
    title: '2025 Quantum Program, WISER',
    detail: 'Quantum algorithms for portfolio optimization, 2025',
    credential: '/certificates/wiser-project-2025.jpg',
  },
  { title: 'QBronze169 Diploma', detail: 'QWorld, 2025', credential: '/certificates/qbronze169.jpg' },
  {
    title: 'PennyLane LCU Challenge',
    detail: 'Womanium & WISER, 2025',
    // SVG (vector): the source PDF renders cut off in-browser.
    credential: '/certificates/pennylane-lcu.svg',
  },
]

export const contact = {
  eyebrow: 'contact',
  title: 'Party invite',
  body: 'Open to AI systems and research software roles. The quickest way to reach me:',
  // The download resolves to the equipped job's resume (see `resumes`); this
  // line explains the job-aware behavior.
  resumeNote: 'The resume matches the equipped role. Switch jobs to swap it.',
}

// Job-aware resume downloads (public/resume/, opened in a new tab). One per
// job; the full CV is the default for the no-job plain-text path.
export const resumes: Record<JobId, string> = {
  physicist: '/resume/Andry_Paez_CV_2026.pdf',
  'ai-systems': '/resume/Andry_Paez_ai_systems.pdf',
  swe: '/resume/Andry_Paez_research_swe.pdf',
  robotics: '/resume/Andry_Paez_robotics.pdf',
}
export const resumeDefault = '/resume/Andry_Paez_CV_2026.pdf'

// Real hardware photos for the Roboticist figure. Deliberately real, never
// AI-painted (workbench honesty rule). `alt` is the full a11y description;
// `caption` is the terse visible line.
export const hardware: { src: string; alt: string; caption: string }[] = [
  {
    src: reachyPhoto,
    alt: 'A Reachy Mini Lite on its Jetson Orin Nano, an ESP32 breadboard running pixel-art firmware, LazyVim open on the monitor.',
    caption: 'Reachy Mini on its Jetson host, ESP32 firmware on the breadboard.',
  },
  {
    src: jetsonPhoto,
    alt: 'A Jetson Orin Nano Developer Kit, the headless edge box that hosts the Reachy.',
    caption: 'The Jetson Orin Nano that runs it all.',
  },
]

export const howIWork = {
  eyebrow: 'how I work',
  title: 'Verification first',
  body: 'I orchestrate coding agents with review gates and never trust an unverified pass: I re-run the tests, drive the live app, and read the diff. The habits come from physics, where a plot is not a result until you know why every feature is there. Off the clock: judo (one tournament, zero wins, undeterred), lifting, Guild Wars 2.',
}

export const footer = {
  line: 'Open to AI systems and research software roles.',
}
