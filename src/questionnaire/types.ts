export type Block = '0' | 'A' | 'B' | 'C' | 'D'

/** How the evaluation agent should aggregate this question across the group. */
export type Aggregation =
  | 'none'
  | 'least_misery'
  | 'median'
  | 'average'
  | 'borda'
  | 'approval'
  | 'union'
  | 'text'

export interface Option {
  value: string
  label: string
  emoji?: string
  description?: string
}

interface BaseQuestion {
  id: string
  block: Block
  /** Short label used in the summary and the codebook. */
  label: string
  /** The question as shown to the participant. */
  title: string
  hint?: string
  emoji?: string
  required: boolean
  aggregation: Aggregation
}

export interface TextQuestion extends BaseQuestion {
  type: 'text'
  placeholder?: string
  multiline?: boolean
  maxLength?: number
}

export interface ScaleQuestion extends BaseQuestion {
  type: 'scale'
  min: number
  max: number
  /** One label per step (min..max). */
  stepLabels?: string[]
  /** One emoji per step (min..max). */
  stepEmojis?: string[]
  /** Labels for the two poles, shown under the scale. */
  poles?: [string, string]
}

export interface SingleQuestion extends BaseQuestion {
  type: 'single'
  options: Option[]
}

export interface MultiQuestion extends BaseQuestion {
  type: 'multi'
  options: Option[]
  min?: number
  max?: number
  /** Selecting this option clears all others (e.g. "none of these"). */
  exclusiveValue?: string
  /** Optional free-text field shown below the options. */
  freeText?: { placeholder: string }
}

export interface RankQuestion extends BaseQuestion {
  type: 'rank'
  options: Option[]
}

export type Question = TextQuestion | ScaleQuestion | SingleQuestion | MultiQuestion | RankQuestion

export type QuestionType = Question['type']

export interface MultiAnswer {
  selected: string[]
  text?: string
}

export type AnswerValue = string | number | string[] | MultiAnswer

export type Answers = Record<string, AnswerValue | undefined>
