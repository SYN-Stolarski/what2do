import { describe, expect, it } from 'vitest'
import { questions } from './schema'
import { canProceed, firstMissingIndex, formatAnswer, isAnswered, toggleMulti, toggleRank } from './logic'
import { buildExport } from './export'
import type { Answers, MultiQuestion, RankQuestion, ScaleQuestion } from './types'

const byId = (id: string) => {
  const q = questions.find((x) => x.id === id)
  if (!q) throw new Error(`missing ${id}`)
  return q
}

describe('schema integrity', () => {
  it('has unique question ids', () => {
    const ids = questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has unique option values per question', () => {
    for (const q of questions) {
      if ('options' in q) {
        const values = q.options.map((o) => o.value)
        expect(new Set(values).size, q.id).toBe(values.length)
      }
    }
  })

  it('scale labels match the number of steps', () => {
    for (const q of questions) {
      if (q.type === 'scale') {
        const steps = q.max - q.min + 1
        if (q.stepLabels) expect(q.stepLabels.length, q.id).toBe(steps)
        if (q.stepEmojis) expect(q.stepEmojis.length, q.id).toBe(steps)
      }
    }
  })

  it('exclusive option exists in the option list', () => {
    for (const q of questions) {
      if (q.type === 'multi' && q.exclusiveValue) {
        expect(q.options.some((o) => o.value === q.exclusiveValue), q.id).toBe(true)
      }
    }
  })

  it('stays within the 5-minute budget', () => {
    expect(questions.length).toBeLessThanOrEqual(18)
  })
})

describe('isAnswered', () => {
  it('text needs non-blank content', () => {
    const q = byId('q00_nickname')
    expect(isAnswered(q, '')).toBe(false)
    expect(isAnswered(q, '   ')).toBe(false)
    expect(isAnswered(q, 'Chris')).toBe(true)
  })

  it('scale needs a number in range', () => {
    const q = byId('q01_energy') as ScaleQuestion
    expect(isAnswered(q, 0)).toBe(false)
    expect(isAnswered(q, 6)).toBe(false)
    expect(isAnswered(q, 3)).toBe(true)
    expect(isAnswered(q, '3')).toBe(false)
  })

  it('single needs a known option', () => {
    const q = byId('q04_time')
    expect(isAnswered(q, 'short')).toBe(true)
    expect(isAnswered(q, 'nope')).toBe(false)
  })

  it('rank needs a full permutation', () => {
    const q = byId('q03_motives') as RankQuestion
    expect(isAnswered(q, ['avoid', 'social'])).toBe(false)
    expect(isAnswered(q, ['avoid', 'social', 'master', 'explore'])).toBe(true)
    expect(isAnswered(q, ['avoid', 'social', 'master', 'master'])).toBe(false)
  })

  it('multi honours min and accepts free text alone', () => {
    const cats = byId('q14_categories') as MultiQuestion
    expect(isAnswered(cats, { selected: [] })).toBe(false)
    expect(isAnswered(cats, { selected: ['bar'] })).toBe(true)
    const nogo = byId('q13_nogo') as MultiQuestion
    expect(isAnswered(nogo, { selected: [], text: 'Knie kaputt' })).toBe(true)
  })
})

describe('canProceed', () => {
  it('lets optional questions pass when empty', () => {
    expect(canProceed(byId('q15_joker'), undefined)).toBe(true)
    expect(canProceed(byId('q15_joker'), '')).toBe(true)
    expect(canProceed(byId('q13_nogo'), { selected: [] })).toBe(true)
  })
  it('blocks required questions when empty', () => {
    expect(canProceed(byId('q01_energy'), undefined)).toBe(false)
  })
})

describe('toggleMulti', () => {
  const nogo = byId('q13_nogo') as MultiQuestion
  it('adds and removes', () => {
    const a = toggleMulti(nogo, undefined, 'alcohol')
    expect(a.selected).toEqual(['alcohol'])
    expect(toggleMulti(nogo, a, 'alcohol').selected).toEqual([])
  })
  it('exclusive option clears the rest and is cleared by others', () => {
    const a = toggleMulti(nogo, { selected: ['alcohol', 'loud'] }, 'none')
    expect(a.selected).toEqual(['none'])
    expect(toggleMulti(nogo, a, 'sweat').selected).toEqual(['sweat'])
  })
  it('keeps the free text', () => {
    const a = toggleMulti(nogo, { selected: [], text: 'x' }, 'loud')
    expect(a.text).toBe('x')
  })
})

describe('toggleRank', () => {
  it('appends and removes while closing gaps', () => {
    let r = toggleRank(undefined, 'a')
    r = toggleRank(r, 'b')
    r = toggleRank(r, 'c')
    expect(r).toEqual(['a', 'b', 'c'])
    expect(toggleRank(r, 'b')).toEqual(['a', 'c'])
  })
})

describe('formatAnswer', () => {
  it('renders scale labels, options and ranks', () => {
    expect(formatAnswer(byId('q01_energy'), 5)).toBe('🚀 Vollgas')
    expect(formatAnswer(byId('q09_novelty'), 4)).toBe('4 / 5')
    expect(formatAnswer(byId('q06_indoor'), 'outdoor')).toBe('🌳 Draußen')
    expect(formatAnswer(byId('q03_motives'), ['social', 'avoid', 'explore', 'master'])).toBe(
      '1. Leute · 2. Abschalten · 3. Was entdecken · 4. Was schaffen',
    )
    expect(formatAnswer(byId('q13_nogo'), { selected: ['loud'], text: 'Knie' })).toBe('Laute Orte, Menschenmassen, „Knie“')
  })
})

describe('export', () => {
  const answers: Answers = {
    q00_nickname: '  Chris ',
    q01_energy: 2,
    q03_motives: ['social', 'avoid', 'explore', 'master'],
    q13_nogo: { selected: ['loud'], text: '  ' },
    q15_joker: '   ',
  }

  it('embeds the codebook with aggregation rules', () => {
    const out = buildExport(answers, { submittedAt: new Date('2026-09-09T18:00:00Z') })
    expect(out.schema_version).toBe('1.0')
    expect(out.codebook.length).toBe(questions.length)
    const energy = out.codebook.find((c) => c.id === 'q01_energy')
    expect(energy?.aggregation).toBe('least_misery')
    expect(energy?.scale?.labels?.[0]).toBe('Sofa-Modus')
    const cats = out.codebook.find((c) => c.id === 'q14_categories')
    expect(cats?.options?.length).toBeGreaterThan(5)
  })

  it('cleans the answers', () => {
    const out = buildExport(answers, { submittedAt: new Date('2026-09-09T18:00:00Z') })
    const r = out.responses[0]
    expect(r.nickname).toBe('Chris')
    expect(r.submitted_at).toBe('2026-09-09T18:00:00.000Z')
    expect(r.answers.q00_nickname).toBe('Chris')
    expect(r.answers.q13_nogo).toEqual({ selected: ['loud'] })
    expect('q15_joker' in r.answers).toBe(false)
    expect('q02_mood' in r.answers).toBe(false)
  })

  it('firstMissingIndex points at the first unanswered required question', () => {
    expect(firstMissingIndex(questions, answers)).toBe(2) // q02_mood
  })
})
