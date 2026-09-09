import { NICKNAME_ID, SCHEMA_VERSION, questions } from './schema'
import type { Answers, Question } from './types'

export interface CodebookEntry {
  id: string
  block: string
  type: Question['type']
  label: string
  text: string
  aggregation: Question['aggregation']
  required: boolean
  scale?: { min: number; max: number; labels?: string[]; poles?: [string, string] }
  options?: { value: string; label: string }[]
  free_text?: boolean
}

export interface ResponseExport {
  nickname: string
  submitted_at: string
  answers: Record<string, unknown>
}

export interface Export {
  schema_version: string
  app_version: string
  codebook: CodebookEntry[]
  responses: ResponseExport[]
}

export function buildCodebook(qs: Question[] = questions): CodebookEntry[] {
  return qs.map((q) => {
    const entry: CodebookEntry = {
      id: q.id,
      block: q.block,
      type: q.type,
      label: q.label,
      text: q.title,
      aggregation: q.aggregation,
      required: q.required,
    }
    if (q.type === 'scale') {
      entry.scale = { min: q.min, max: q.max, labels: q.stepLabels, poles: q.poles }
    }
    if (q.type === 'single' || q.type === 'multi' || q.type === 'rank') {
      entry.options = q.options.map((o) => ({ value: o.value, label: o.label }))
    }
    if (q.type === 'multi' && q.freeText) entry.free_text = true
    return entry
  })
}

/** Strip undefined and trim strings so the export is clean. */
function cleanAnswers(answers: Answers): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const q of questions) {
    const v = answers[q.id]
    if (v === undefined) continue
    if (typeof v === 'string') {
      const t = v.trim()
      if (t) out[q.id] = t
    } else if (typeof v === 'object' && !Array.isArray(v)) {
      const text = v.text?.trim()
      out[q.id] = text ? { selected: v.selected, text } : { selected: v.selected }
    } else {
      out[q.id] = v
    }
  }
  return out
}

export function buildExport(
  answers: Answers,
  opts: { submittedAt?: Date; appVersion?: string } = {},
): Export {
  const nick = answers[NICKNAME_ID]
  return {
    schema_version: SCHEMA_VERSION,
    app_version: opts.appVersion ?? '0.1.0',
    codebook: buildCodebook(),
    responses: [
      {
        nickname: typeof nick === 'string' ? nick.trim() : '',
        submitted_at: (opts.submittedAt ?? new Date()).toISOString(),
        answers: cleanAnswers(answers),
      },
    ],
  }
}
