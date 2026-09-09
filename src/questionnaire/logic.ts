import type { AnswerValue, Answers, MultiAnswer, Question } from './types'

export function isMultiAnswer(v: AnswerValue | undefined): v is MultiAnswer {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && 'selected' in v
}

/** True when the given value counts as a complete answer for the question. */
export function isAnswered(q: Question, value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false
  switch (q.type) {
    case 'text':
      return typeof value === 'string' && value.trim().length > 0
    case 'scale':
      return typeof value === 'number' && value >= q.min && value <= q.max
    case 'single':
      return typeof value === 'string' && q.options.some((o) => o.value === value)
    case 'multi': {
      if (!isMultiAnswer(value)) return false
      const valid = value.selected.every((v) => q.options.some((o) => o.value === v))
      if (!valid) return false
      const count = value.selected.length
      if (q.min !== undefined && count < q.min) return false
      if (q.max !== undefined && count > q.max) return false
      return count > 0 || Boolean(value.text?.trim())
    }
    case 'rank': {
      if (!Array.isArray(value)) return false
      const all = q.options.map((o) => o.value)
      return value.length === all.length && all.every((v) => value.includes(v))
    }
  }
}

/** A question may be left when it is answered, or when it is optional. */
export function canProceed(q: Question, value: AnswerValue | undefined): boolean {
  if (!q.required) return value === undefined || isAnswered(q, value) || isEmpty(q, value)
  return isAnswered(q, value)
}

export function isEmpty(q: Question, value: AnswerValue | undefined): boolean {
  if (value === undefined) return true
  if (q.type === 'text') return typeof value === 'string' && value.trim().length === 0
  if (q.type === 'multi') return isMultiAnswer(value) && value.selected.length === 0 && !value.text?.trim()
  return false
}

/** Index of the first required question without a valid answer, or -1. */
export function firstMissingIndex(questions: Question[], answers: Answers): number {
  return questions.findIndex((q) => q.required && !isAnswered(q, answers[q.id]))
}

export function isComplete(questions: Question[], answers: Answers): boolean {
  return firstMissingIndex(questions, answers) === -1
}

/** Toggle a value in a multi answer, honouring the exclusive option. */
export function toggleMulti(
  q: Extract<Question, { type: 'multi' }>,
  current: MultiAnswer | undefined,
  value: string,
): MultiAnswer {
  const selected = current?.selected ?? []
  const text = current?.text
  if (selected.includes(value)) {
    return { selected: selected.filter((v) => v !== value), text }
  }
  if (q.exclusiveValue && value === q.exclusiveValue) {
    return { selected: [value], text }
  }
  const withoutExclusive = q.exclusiveValue ? selected.filter((v) => v !== q.exclusiveValue) : selected
  if (q.max !== undefined && withoutExclusive.length >= q.max) {
    return { selected: withoutExclusive, text }
  }
  return { selected: [...withoutExclusive, value], text }
}

/** Toggle a value in a rank answer: append if absent, remove (and close the gap) if present. */
export function toggleRank(current: string[] | undefined, value: string): string[] {
  const order = current ?? []
  return order.includes(value) ? order.filter((v) => v !== value) : [...order, value]
}

/** Human-readable rendering of an answer, for the summary screen. */
export function formatAnswer(q: Question, value: AnswerValue | undefined): string {
  if (value === undefined) return '–'
  switch (q.type) {
    case 'text':
      return typeof value === 'string' && value.trim() ? value.trim() : '–'
    case 'scale': {
      if (typeof value !== 'number') return '–'
      const i = value - q.min
      const label = q.stepLabels?.[i]
      const emoji = q.stepEmojis?.[i]
      if (label) return emoji ? `${emoji} ${label}` : label
      return `${value} / ${q.max}`
    }
    case 'single': {
      const o = q.options.find((x) => x.value === value)
      return o ? (o.emoji ? `${o.emoji} ${o.label}` : o.label) : '–'
    }
    case 'multi': {
      if (!isMultiAnswer(value)) return '–'
      const labels = value.selected
        .map((v) => q.options.find((o) => o.value === v)?.label)
        .filter((x): x is string => Boolean(x))
      const parts = [...labels]
      if (value.text?.trim()) parts.push(`„${value.text.trim()}“`)
      return parts.length ? parts.join(', ') : '–'
    }
    case 'rank': {
      if (!Array.isArray(value)) return '–'
      return value
        .map((v, i) => {
          const o = q.options.find((x) => x.value === v)
          return o ? `${i + 1}. ${o.label}` : null
        })
        .filter(Boolean)
        .join(' · ')
    }
  }
}
