import { useEffect, useRef, useState } from 'react'
import { runCommand, type CmdLine } from './terminalCommands'
import type { JobId } from '../content/jobs'

// The persistent MMO chat box: bottom-left, theme-tinted, a real shell. It
// appears once a job is equipped. Collapsed by default on mobile so it never
// covers the content on a phone.
const GREETING: CmdLine[] = [
  { text: "chat / shell — type 'help'. this is a real terminal.", kind: 'dim' },
]

function isMobile() {
  try {
    return matchMedia('(max-width: 640px)').matches
  } catch {
    return false
  }
}

export function Terminal({ job, equip }: { job: JobId | null; equip: (id: JobId) => void }) {
  const [open, setOpen] = useState(() => !isMobile())
  const [lines, setLines] = useState<CmdLine[]>(GREETING)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [lines, open])

  const submit = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const raw = input
    setInput('')
    setHistIdx(-1)
    if (raw.trim()) setHistory((h) => [...h, raw])
    const echo: CmdLine = { text: `> ${raw}`, kind: 'dim' }
    const out = runCommand(raw, {
      job,
      equip,
      clear: () => setLines([]),
    })
    // clear handled inside runCommand mutates via callback; if it cleared, skip echo append
    if (raw.trim() === 'clear') return
    setLines((prev) => [...prev, echo, ...out])
  }

  // up/down walks command history, like a real shell
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const idx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(idx)
      setInput(history[idx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx < 0) return
      const idx = histIdx + 1
      if (idx >= history.length) {
        setHistIdx(-1)
        setInput('')
      } else {
        setHistIdx(idx)
        setInput(history[idx])
      }
    }
  }

  return (
    <section className={`terminal${open ? ' open' : ''}`} aria-label="chat terminal">
      <button
        type="button"
        className="terminal-bar"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="terminal-dot" aria-hidden="true" />
        <span className="terminal-title">chat</span>
        <span className="terminal-toggle" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="terminal-body">
          <div className="terminal-log" ref={logRef} aria-live="polite">
            {lines.map((l, i) => (
              <div key={i} className={`term-line term-${l.kind ?? 'out'}`}>
                {l.text}
              </div>
            ))}
          </div>
          <form className="terminal-input" onSubmit={submit}>
            <span className="term-prompt" aria-hidden="true">{job ?? 'guest'}&nbsp;$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              aria-label="terminal input"
            />
          </form>
        </div>
      )}
    </section>
  )
}
