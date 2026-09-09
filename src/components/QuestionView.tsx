import type { AnswerValue, MultiAnswer, Question } from '../questionnaire/types'
import { blockNames } from '../questionnaire/schema'
import { TextInput } from './inputs/TextInput'
import { ScaleInput } from './inputs/ScaleInput'
import { SingleChoice } from './inputs/SingleChoice'
import { MultiChoice } from './inputs/MultiChoice'
import { RankInput } from './inputs/RankInput'

interface Props {
  q: Question
  index: number
  value: AnswerValue | undefined
  onChange: (v: AnswerValue) => void
  onSubmit: () => void
}

export function QuestionView({ q, index, value, onChange, onSubmit }: Props) {
  return (
    <section className="q" key={q.id}>
      <div className="q__meta mono">
        <span>
          Frage {String(index + 1).padStart(2, '0')} · {blockNames[q.block]}
        </span>
        <span>{q.required ? 'Pflicht' : 'Optional'}</span>
      </div>
      <h1 className="q__title">{q.title}</h1>
      {q.hint && <p className="q__hint">{q.hint}</p>}
      {renderInput(q, value, onChange, onSubmit)}
    </section>
  )
}

function renderInput(q: Question, value: AnswerValue | undefined, onChange: (v: AnswerValue) => void, onSubmit: () => void) {
  switch (q.type) {
    case 'text':
      return <TextInput q={q} value={typeof value === 'string' ? value : undefined} onChange={onChange} onSubmit={onSubmit} />
    case 'scale':
      return <ScaleInput q={q} value={typeof value === 'number' ? value : undefined} onChange={onChange} />
    case 'single':
      return <SingleChoice q={q} value={typeof value === 'string' ? value : undefined} onChange={onChange} />
    case 'multi':
      return (
        <MultiChoice
          q={q}
          value={value && typeof value === 'object' && !Array.isArray(value) ? (value as MultiAnswer) : undefined}
          onChange={onChange}
        />
      )
    case 'rank':
      return <RankInput q={q} value={Array.isArray(value) ? value : undefined} onChange={onChange} />
  }
}
