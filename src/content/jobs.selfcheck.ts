// Run: node src/content/jobs.selfcheck.ts  (same pattern as gpe.selfcheck.ts)
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { JOBS, isJobId } from './jobs.ts'
import { chapters } from './story.ts'

// 1. Exactly four jobs, unique ids, in select-screen order.
assert.deepStrictEqual(
  JOBS.map((j) => j.id),
  ['physicist', 'ai-systems', 'swe', 'robotics'],
)

// 2. Every palette entry is a hex color; name present; tagline has no em dash.
for (const j of JOBS) {
  for (const [k, v] of Object.entries(j.palette)) {
    assert.match(v, /^#[0-9a-f]{6}$/i, `${j.id}.palette.${k} = ${v}`)
  }
  assert.ok(j.name.length > 0, j.id)
  assert.ok(j.tagline.length > 0 && !j.tagline.includes('—'), `${j.id} tagline (no em dashes)`)
}

// 3. isJobId guards.
assert.ok(isJobId('physicist') && !isJobId('warlock') && !isJobId(null))

// 4. The CSS token blocks in index.css stay in sync with each job's palette.
const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
for (const j of JOBS) {
  const block = css.match(new RegExp(`:root\\[data-job='${j.id}'\\]\\s*\\{([^}]*)\\}`))
  assert.ok(block, `index.css has a token block for ${j.id}`)
  for (const [k, v] of Object.entries(j.palette)) {
    assert.ok(block![1].includes(v), `${j.id} css block carries palette.${k} = ${v}`)
  }
}

// 5. The life story ships only in Andry's own words: no placeholder chapter
// reaches a deploy, ids are unique, and the copy has no em dashes.
assert.strictEqual(new Set(chapters.map((c) => c.id)).size, chapters.length, 'unique chapter ids')
for (const c of chapters) {
  assert.ok(!c.draft, `chapter "${c.id}" is still a placeholder draft`)
  for (const t of [c.period, c.title, ...c.body]) {
    assert.ok(!t.includes('—'), `chapter "${c.id}" has an em dash`)
  }
}

console.log('jobs selfcheck passed')
