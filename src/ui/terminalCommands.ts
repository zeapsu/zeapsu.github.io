// The chat terminal's command set. Small, and every command is backed by
// real data or real computation -- no cosplay `sudo hire-me`. /selfcheck runs
// the actual GPE solver in the browser (honest-physics guardrail).
import { createSim } from '../sim/gpe'
import { JOBS, isJobId, type JobId } from '../content/jobs'
import { identity, research, projects } from '../content/data'

export interface CmdLine {
  text: string
  kind?: 'out' | 'err' | 'ok' | 'dim'
}

export interface CmdContext {
  job: JobId | null
  equip: (id: JobId) => void
  clear: () => void
}

const HELP: CmdLine[] = [
  { text: 'commands:', kind: 'dim' },
  { text: '  help              this list' },
  { text: '  ls [projects]     list projects' },
  { text: '  cat research.md   research summary' },
  { text: '  cat <project>     a project, by name' },
  { text: '  job <name>        switch job (physicist, ai-systems, swe, robotics)' },
  { text: '  whoami            who I am' },
  { text: '  resume            how to get my resume' },
  { text: '  /selfcheck        run the live GPE solver checks' },
  { text: '  clear             clear the log' },
]

// runs the same physics the node selfcheck pins, live in the browser
function selfcheck(): CmdLine[] {
  const out: CmdLine[] = [{ text: 'running gpe self-check…', kind: 'dim' }]

  // 1. norm conservation (undamped split-step conserves to FFT roundoff)
  const a = createSim({ n: 256, damping: 0 })
  const norm0 = a.norm()
  a.step(400)
  const drift = Math.abs(a.norm() - norm0) / norm0
  const normOk = drift < 1e-6
  out.push({
    text: `  norm conservation: drift ${drift.toExponential(2)} ${normOk ? '< 1e-6  PASS' : '>= 1e-6  FAIL'}`,
    kind: normOk ? 'ok' : 'err',
  })

  // 2. quench forms domain walls and spin saturates
  const b = createSim({ n: 256, damping: 0.03, seed: 42 })
  b.quench()
  b.step(3000)
  let walls = 0
  const s = b.spin
  for (let i = 0; i < s.length; i++) {
    if (Math.sign(s[i]) !== Math.sign(s[(i + 1) % s.length]) && Math.abs(s[i]) > 0.1) walls++
  }
  let maxAbs = 0
  for (let i = 0; i < s.length; i++) maxAbs = Math.max(maxAbs, Math.abs(s[i]))
  const wallsOk = walls >= 2 && maxAbs > 0.5
  out.push({
    text: `  quench: ${walls} domain walls, max |spin| ${maxAbs.toFixed(3)}  ${wallsOk ? 'PASS' : 'FAIL'}`,
    kind: wallsOk ? 'ok' : 'err',
  })

  out.push({
    text: normOk && wallsOk ? 'all checks passed. the aurora is real physics.' : 'a check failed.',
    kind: normOk && wallsOk ? 'ok' : 'err',
  })
  return out
}

export function runCommand(raw: string, ctx: CmdContext): CmdLine[] {
  const input = raw.trim()
  if (!input) return []
  const [cmd, ...rest] = input.split(/\s+/)
  const arg = rest.join(' ')

  switch (cmd) {
    case 'help':
      return HELP

    case 'ls':
      return projects.map((p) => ({ text: p.name }))

    case 'cat': {
      if (arg === 'research.md') {
        return [
          { text: research.title, kind: 'ok' },
          { text: research.body },
          ...research.facts.map((f) => ({ text: `- ${f}`, kind: 'dim' as const })),
        ]
      }
      const proj = projects.find((p) => p.name.toLowerCase() === arg.toLowerCase())
      if (proj) {
        return [
          { text: `${proj.name}  (${proj.status})`, kind: 'ok' },
          { text: proj.blurb },
          ...proj.facts.map((f) => ({ text: `- ${f}`, kind: 'dim' as const })),
        ]
      }
      return [{ text: `cat: ${arg || '(no file)'}: not found. try 'ls' or 'cat research.md'.`, kind: 'err' }]
    }

    case 'job': {
      if (isJobId(arg)) {
        ctx.equip(arg)
        const j = JOBS.find((x) => x.id === arg)!
        return [{ text: `equipping ${j.name}…`, kind: 'ok' }]
      }
      return [
        { text: `job: unknown job '${arg}'.`, kind: 'err' },
        { text: `  choices: ${JOBS.map((j) => j.id).join(', ')}`, kind: 'dim' },
      ]
    }

    case 'whoami':
      return [
        { text: identity.name, kind: 'ok' },
        { text: identity.tagline },
        { text: `${identity.email} · github.com/zeapsu`, kind: 'dim' },
      ]

    case 'resume':
      return [
        { text: 'Job-specific resumes are on the way.', kind: 'ok' },
        { text: `Email ${identity.email} and I will send the right one.` },
      ]

    case '/selfcheck':
    case 'selfcheck':
      return selfcheck()

    case 'clear':
      ctx.clear()
      return []

    default:
      return [{ text: `${cmd}: command not found. type 'help'.`, kind: 'err' }]
  }
}
