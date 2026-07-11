// All site copy lives here so it can be audited line-by-line against
// ~/Documents/personal/experience.md. Do not add claims that are not in that file.
import type { JobId } from './jobs'
import sageShot from '../assets/screenshots/sage.jpg'
import qaoaShot from '../assets/screenshots/qaoa.png'
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
}

export const research = {
  eyebrow: 'now',
  title: 'Simulating ultracold atoms at San Jose State',
  // Display-type pull-stat for the NOW section; the same fact stays in
  // `facts` in full (the stat is aria-hidden decoration of a stated fact).
  pullStat: {
    value: '1,880×',
    label: 'sine-DVR kinetic-energy operator, 161 s → 0.09 s, verified bit-exact',
  },
  body: 'Research assistant in the Dept. of Physics & Astronomy, working on spinor Bose-Einstein condensate simulations with Dr. Hilary Hurst. I build the code that keeps the science running: a CLI and HDF5 pipeline for ground states and Bogoliubov-de Gennes spectra, reproducible environments, and Slurm workflows on the SJSU cluster.',
  facts: [
    'Vectorized the sine-DVR kinetic-energy operator: 161 s down to 0.09 s at 2048 grid points, a 1,880× speedup verified bit-exact by a benchmark harness',
    'Validated spinor ground states to machine precision (norm error 2.2e-16) with correct miscible and immiscible domain-wall structure',
    'Hash-addressed initial-condition catalog with a rebuildable SQLite index and a write-then-index HPC workflow that avoids concurrent-writer contention',
    'Ran a c2-quench study of spontaneous symmetry breaking with Truncated Wigner vacuum-noise seeding and domain-wall counting, recovering Kibble-Zurek scaling (exponent 1/4)',
    'Dated technical reports: benchmarks, validations, design recommendations whose conclusions set project defaults.',
  ],
}

export interface Project {
  name: string
  blurb: string
  facts: string[]
  /** facet tags: which lenses feature/sort this project (rename-proof — the
   *  association lives on the project, not on a display-name lookup) */
  jobs: JobId[]
  link?: string
  // A real UI screenshot of the shipped project (private projects show
  // their UI only; privacy is conveyed by the absence of a link).
  image?: string
  imageAlt?: string
}

export const projects: Project[] = [
  {
    name: 'reachy-console',
    jobs: ['robotics', 'ai-systems'],
    blurb:
      'Control console and voice assistant for a Reachy Mini robot living on a headless Jetson Orin Nano. Private repo, ask me about it.',
    facts: [
      'FastAPI + vanilla JS web console, a pure HTTP/WS proxy so the robot daemon stays the single writer to the hardware',
      'Voice pipeline: mic to faster-whisper to LLM to TTS, with live camera frames for visual questions',
      'Real hardware debugging: built webrtcsink from source for arm64, root-caused speaker silence to ALSA card remapping after an OS migration',
    ],
    image: reachyConsoleShot,
    imageAlt: 'The reachy-console web UI: live camera feed and robot controls.',
  },
  {
    name: 'Kalshi weather markets',
    jobs: ['ai-systems', 'swe'],
    blurb:
      'ML forecasting and a trading engine for weather prediction markets. Not a profitable bot, and I say so. Private repo, ask me about it.',
    facts: [
      'NWS and commercial forecast ingestion, a Gaussian edge model, and stacked LSTM temperature models in PyTorch with per-city artifacts',
      'A trading engine with bracket parsing and ASOS rounding compensation, plus a Streamlit dashboard',
    ],
    image: kalshiShot,
    imageAlt: 'The Kalshi weather-markets dashboard: market overview.',
  },
  {
    name: 'Sage',
    jobs: ['ai-systems', 'swe'],
    blurb: 'Local-first desktop knowledge agent: add sources, chat with citations, generate quizzes and audio narration.',
    facts: [
      'Tauri + Next.js + FastAPI + SQLite with embeddings; provider abstraction across OpenAI, Anthropic, DeepSeek, Ollama',
      '15 months of sustained work, then a deliberate stop. The kill decision and its rationale are in the repo.',
    ],
    link: 'https://github.com/zeapsu/Sage',
    image: sageShot,
    imageAlt: 'The Sage desktop app home screen: the Tome chat prompt and skill actions (Sources, Report, Quiz, Flashcards, Audio, Chat).',
  },
  {
    name: 'Quantum computing work',
    jobs: ['physicist'],
    blurb: 'QAOA portfolio optimization and quantum error correction on real hardware.',
    facts: [
      'QAOA as a new ansatz family benchmarked against CPLEX on a 31-bond portfolio: 5.6% median objective gap from QAOA alone, 0.02% after about 20 local-search evaluations',
      "Shor's 9-qubit code run on IBM hardware via Qiskit Runtime, measuring a 36% fidelity improvement",
    ],
    link: 'https://github.com/zeapsu/Quantum-Portfolio-Optimization',
    image: qaoaShot,
    imageAlt:
      'QAOA benchmark boxplot: optimizer iterations to last improvement versus circuit depth, p = 1 to 5.',
  },
]

// Quest log: education + work as a completed quest chain. The pre-2021
// years are rendered as one honest "time away" line — the Cal Poly stint is
// on experience.md's exclusions list, so it is named nowhere on the site.
export const questLog = {
  eyebrow: 'path',
  title: 'Background',
  intro:
    'The route here was not a straight line: community college to a physics degree to an RA position.',
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
        'Four associate degrees, all with honors: Computer Science, Mathematics, Physics, and Language & Rationality. President’s List five times, GPA 3.73.',
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
      // Deduplicated: the full research story lives in the NOW section above.
      detail: 'Spinor Bose-Einstein condensate simulations with Dr. Hilary Hurst. The work in Now, above.',
      status: 'active' as const,
    },
  ],
}

// Skill field: one cloud, four wavelengths (the four jobs). The active
// facet's motes catch the light; the rest grey out. Tokens are the audited
// skill strings re-chunked to cloud size — every token traces to
// experience.md's skills/projects sections, nothing added.
export const skillTree: { job: JobId; branch: string; skills: string[] }[] = [
  {
    job: 'physicist',
    branch: 'Physics',
    skills: [
      'Quantum information',
      'Qiskit',
      'QAOA',
      'Shor-code error correction',
      'NumPy',
      'FFT/spectral methods',
      'Monte Carlo',
      'Gross-Pitaevskii simulation',
      'HDF5',
      'Slurm/HPC',
    ],
  },
  {
    job: 'ai-systems',
    branch: 'AI Systems',
    skills: [
      'Local inference',
      'llama.cpp (ARM64 CUDA source build)',
      'Ollama',
      'quantization-aware selection',
      'K/I-quants',
      'LoRA fine-tuning',
      'KV-cache tradeoffs',
      'MoE pruning',
      'ReAct tool loops',
      'MCP',
      'multi-agent review gates',
      'agent harnesses',
      'faster-whisper',
      'edge deployment',
    ],
  },
  {
    job: 'swe',
    branch: 'Research Software Engineering',
    skills: [
      'Python',
      'TypeScript',
      'Rust (Tauri)',
      'C/C++',
      'FastAPI',
      'Next.js/React',
      'WebSockets/SSE',
      'CI',
      'pytest',
      'Playwright-driven verification',
    ],
  },
  {
    job: 'robotics',
    branch: 'Robotics',
    skills: [
      'edge inference',
      'voice + vision pipelines',
      'Jetson Orin Nano',
      'GStreamer',
      'ALSA/PipeWire',
      'kernel-driver debugging',
      'ESP32 firmware',
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

// Grouped by source so SJSU and MJC honors read separately. Degrees live in
// the Background timeline only (the MJC entry lists all four); this grid is
// honors and certificates, no duplication.
export const achievementGroups: { label: string; items: Achievement[] }[] = [
  {
    label: 'San Jose State',
    items: [
      { title: 'Dean’s Scholar', detail: 'Fall 2024 and Fall 2025' },
      { title: 'Sigma Pi Sigma', detail: 'Physics honor society (AIP/SPS), lifetime member, 2026' },
    ],
  },
  {
    label: 'Modesto Junior College',
    items: [{ title: 'President’s List × 5', detail: '2021 – 2024' }],
  },
  {
    label: 'Programs & certificates',
    items: [
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
    ],
  },
]
// Flat view for the plain fallback.
export const achievements: Achievement[] = achievementGroups.flatMap((g) =>
  g.items.map((a) => ({ ...a, detail: `${g.label}: ${a.detail}` })),
)

export const contact = {
  body: 'Open to AI systems and research software roles. The quickest way to reach me:',
  // The download resolves to the active focus's resume (see `resumes`); this
  // line explains the focus-aware behavior.
  resumeNote: 'The resume matches the focus you pick above.',
}

// Job-aware resume downloads (public/resume/, opened in a new tab). One per
// job; the full CV is the default for the no-job plain-text path.
export const resumes: Record<JobId, string> = {
  physicist: '/resume/Andry_Paez_CV_2026.pdf',
  'ai-systems': '/resume/Andry_Paez_ai_systems.pdf',
  swe: '/resume/Andry_Paez_research_swe.pdf',
  robotics: '/resume/Andry_Paez_robotics.pdf',
}
// One source of truth for the CV path (also the physicist's resume).
export const resumeDefault = resumes.physicist

// Real hardware photos for the Roboticist figure. Deliberately real, never
// AI-painted (workbench honesty rule). `alt` is the full a11y description;
// `caption` is the terse visible line; `w`/`h` are intrinsic pixel dimensions
// so the browser reserves space and the lazy images don't shift layout.
export const hardware: { src: string; alt: string; caption: string; w: number; h: number }[] = [
  {
    src: reachyPhoto,
    alt: 'A Reachy Mini Lite on its Jetson Orin Nano, an ESP32 breadboard running pixel-art firmware, LazyVim open on the monitor.',
    caption: 'Reachy Mini on its Jetson host, ESP32 firmware on the breadboard.',
    w: 1050,
    h: 1400,
  },
  {
    src: jetsonPhoto,
    alt: 'A Jetson Orin Nano Developer Kit, the headless edge box that hosts the Reachy.',
    caption: 'The Jetson Orin Nano that runs it all.',
    w: 1400,
    h: 1050,
  },
]

// The closing sheet: who I am off the clock, then the contact essentials.
// Interests trace to experience.md's Personal section (cleared 2026-07-07).
export const about = {
  eyebrow: 'about',
  title: 'Off the clock',
  body: 'Away from the keyboard: Marvel and scary movies, souls-like games, pickleball, judo (one tournament, zero wins, undeterred), and time with family and the cats. Music runs all day: R&B, UK garage, EDM, dubstep, jazz, classical, JRPG soundtracks. I genuinely enjoy grocery shopping.',
}

