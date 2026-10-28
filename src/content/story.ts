// The life story: the default view of the deck. Andry writes every word of
// it, in their own voice; agents build the frame and suggest edits only.
// Chapters run in life order, and each one can pull in the work sheets
// that happened during it (`sheets`), so the portfolio is met inside the
// story instead of after it. The "just the work" view drops the chapters
// and shows the classic deck.
//
// Facts in here still have to trace to ~/Documents/personal/experience.md
// and respect its exclusions; anything new goes into that file first.
//
// `draft: true` marks a chapter whose words are not Andry's yet. The
// selfcheck refuses to deploy while any chapter is still a draft.

/** The work sheets a chapter can pull in after itself. */
export type SheetId = 'now' | 'work' | 'skills' | 'recognition'

export interface Chapter {
  id: string
  /** shown as the chapter's display numeral, e.g. "2021" or "before 2021" */
  period: string
  title: string
  /** one string per paragraph */
  body: string[]
  /** work sheets that follow this chapter, in order */
  sheets?: SheetId[]
  draft?: boolean
}

// Placeholder copy below is deliberately plain and labelled. The comment on
// each chapter holds the prompts it was scaffolded from; delete or ignore.
export const chapters: Chapter[] = [
  {
    // Where you grew up, family, what you were like as a kid, the first
    // thing that made you curious about how things work.
    id: 'beginning',
    period: 'early years',
    title: 'Where it starts',
    body: ['Placeholder. Andry writes this chapter: growing up, family, and what first made the world interesting.'],
    draft: true,
  },
  {
    // "The long way round": the years before community college, what you
    // were doing, and what turned you toward school and physics.
    id: 'long-way',
    period: 'before 2021',
    title: 'The long way round',
    body: ['Placeholder. Andry writes this chapter: the years before school, and what changed.'],
    draft: true,
  },
  {
    // Modesto Junior College: four associate degrees, why that many, the
    // moment physics stuck, teachers or people who mattered.
    id: 'mjc',
    period: '2021',
    title: 'Modesto Junior College',
    body: ['Placeholder. Andry writes this chapter: community college, four degrees, and falling for physics.'],
    draft: true,
  },
  {
    // San Jose State: moving, what the B.S. was like, quantum mechanics and
    // quantum information, Sigma Pi Sigma. The honors sheet follows.
    id: 'sjsu',
    period: '2024',
    title: 'San Jose State',
    body: ['Placeholder. Andry writes this chapter: moving to San Jose and the physics degree.'],
    sheets: ['recognition'],
    draft: true,
  },
  {
    // Quantum: WISER, QWorld, the PennyLane challenge, running Shor's code
    // on IBM hardware. What it felt like to run on a real machine.
    id: 'quantum',
    period: '2025',
    title: 'Quantum, for real',
    body: ['Placeholder. Andry writes this chapter: the quantum programs and running code on real hardware.'],
    draft: true,
  },
  {
    // Research with Dr. Hurst: how you joined, what the condensate work is
    // about in plain words, what you like about it. The NOW sheet follows.
    id: 'research',
    period: '2026',
    title: 'Ultracold atoms',
    body: ['Placeholder. Andry writes this chapter: joining Dr. Hurst’s group and the condensate simulations.'],
    sheets: ['now'],
    draft: true,
  },
  {
    // Building: Reachy, Sage, the Kalshi experiment, directing agents
    // (agentic engineering). Why you build on hardware you can point at.
    // The work and skills sheets follow.
    id: 'building',
    period: 'on the side',
    title: 'Building things',
    body: ['Placeholder. Andry writes this chapter: the projects, the robot on the desk, and working with agents.'],
    sheets: ['work', 'skills'],
    draft: true,
  },
  {
    // What's next: what you want to work on, the kind of team, where you
    // hope this goes. The closing sheet (off the clock + contact) follows.
    id: 'next',
    period: 'next',
    title: 'Where I’m headed',
    body: ['Placeholder. Andry writes this chapter: what comes next.'],
    draft: true,
  },
]
