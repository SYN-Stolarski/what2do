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
    const required = questions.filter((q) => q.required).length
    expect(required).toBeLessThanOrEqual(16)
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
    const q = byId('q03_social_battery') as ScaleQuestion
    expect(isAnswered(q, 0)).toBe(false)
    expect(isAnswered(q, 6)).toBe(false)
    expect(isAnswered(q, 3)).toBe(true)
    expect(isAnswered(q, '3')).toBe(false)
  })

  it('single needs a known option', () => {
    const q = byId('q14_length')
    expect(isAnswered(q, 'short')).toBe(true)
    expect(isAnswered(q, 'nope')).toBe(false)
  })

  it('rank needs a full permutation', () => {
    const q = byId('q05_missing') as RankQuestion
    expect(isAnswered(q, ['release', 'connection'])).toBe(false)
    expect(isAnswered(q, ['release', 'connection', 'competence', 'autonomy'])).toBe(true)
    expect(isAnswered(q, ['release', 'connection', 'competence', 'competence'])).toBe(false)
  })

  it('multi honours min and accepts free text alone', () => {
    const esc = byId('q06_escape') as MultiQuestion
    expect(isAnswered(esc, { selected: [] })).toBe(false)
    expect(isAnswered(esc, { selected: ['screens'] })).toBe(true)
    const waste = byId('q15_waste') as MultiQuestion
    expect(isAnswered(waste, { selected: [], text: 'Knie kaputt' })).toBe(true)
  })
})

describe('canProceed', () => {
  it('lets optional questions pass when empty', () => {
    expect(canProceed(byId('q17_joker'), undefined)).toBe(true)
    expect(canProceed(byId('q17_joker'), '')).toBe(true)
    expect(canProceed(byId('q16_word'), '')).toBe(true)
  })
  it('blocks required questions when empty', () => {
    expect(canProceed(byId('q03_social_battery'), undefined)).toBe(false)
    expect(canProceed(byId('q15_waste'), { selected: [] })).toBe(false)
  })
})

describe('toggleMulti', () => {
  const nogo = byId('q15_waste') as MultiQuestion
  it('adds and removes', () => {
    const a = toggleMulti(nogo, undefined, 'alcohol')
    expect(a.selected).toEqual(['alcohol'])
    expect(toggleMulti(nogo, a, 'alcohol').selected).toEqual([])
  })
  it('exclusive option clears the rest and is cleared by others', () => {
    const a = toggleMulti(nogo, { selected: ['alcohol', 'crowds'] }, 'nothing')
    expect(a.selected).toEqual(['nothing'])
    expect(toggleMulti(nogo, a, 'exertion').selected).toEqual(['exertion'])
  })
  it('keeps the free text', () => {
    const a = toggleMulti(nogo, { selected: [], text: 'x' }, 'crowds')
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
    expect(formatAnswer(byId('q10_surprise'), 4)).toBe('4 / 5')
    expect(formatAnswer(byId('q02_body'), 'lead')).toBe('Schwer wie Blei')
    expect(formatAnswer(byId('q05_missing'), ['connection', 'release', 'autonomy', 'competence'])).toBe(
      '1. Nähe · 2. Nichts müssen · 3. Selbstbestimmung · 4. Wirksamkeit',
    )
    expect(formatAnswer(byId('q15_waste'), { selected: ['crowds'], text: 'Knie' })).toBe('Menschenmassen und Lärm, „Knie“')
  })
})

describe('export', () => {
  const answers: Answers = {
    q00_nickname: '  Chris ',
    q01_weather: 'fog',
    q03_social_battery: 2,
    q05_missing: ['connection', 'release', 'autonomy', 'competence'],
    q15_waste: { selected: ['crowds'], text: '  ' },
    q17_joker: '   ',
  }

  it('embeds the codebook with aggregation rules', () => {
    const out = buildExport(answers, { submittedAt: new Date('2026-09-09T18:00:00Z') })
    expect(out.schema_version).toBe('2.0')
    expect(out.codebook.length).toBe(questions.length)
    const battery = out.codebook.find((c) => c.id === 'q03_social_battery')
    expect(battery?.aggregation).toBe('least_misery')
    expect(battery?.scale?.poles?.[0]).toBe('Fast leer, bitte wenig Input')
    const genre = out.codebook.find((c) => c.id === 'q08_genre')
    expect(genre?.options?.length).toBe(7)
    const waste = out.codebook.find((c) => c.id === 'q15_waste')
    expect(waste?.free_text).toBe(true)
  })

  it('cleans the answers', () => {
    const out = buildExport(answers, { submittedAt: new Date('2026-09-09T18:00:00Z') })
    const r = out.responses[0]
    expect(r.nickname).toBe('Chris')
    expect(r.submitted_at).toBe('2026-09-09T18:00:00.000Z')
    expect(r.answers.q00_nickname).toBe('Chris')
    expect(r.answers.q15_waste).toEqual({ selected: ['crowds'] })
    expect('q17_joker' in r.answers).toBe(false)
    expect('q02_body' in r.answers).toBe(false)
  })

  it('firstMissingIndex points at the first unanswered required question', () => {
    expect(firstMissingIndex(questions, answers)).toBe(2) // q02_body
  })
})
