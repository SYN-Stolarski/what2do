import { toggleMulti } from '../../questionnaire/logic'
import type { MultiAnswer, MultiQuestion } from '../../questionnaire/types'

interface Props {
  q: MultiQuestion
  value: MultiAnswer | undefined
  onChange: (v: MultiAnswer) => void
}

export function MultiChoice({ q, value, onChange }: Props) {
  const selected = value?.selected ?? []
  return (
    <div className="q__body">
      <div className="sheet">
        <div className="grid-2" role="group">
          {q.options.map((o, i) => {
            const on = selected.includes(o.value)
            return (
              <button
                key={o.value}
                type="button"
                role="checkbox"
                aria-checked={on}
                className={`chip${on ? ' chip--on' : ''}`}
                onClick={() => onChange(toggleMulti(q, value, o.value))}
              >
                <span className="chip__mark" aria-hidden="true" />
                <span className="chip__idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="chip__label">{o.label}</span>
                {o.description && <span className="chip__desc">{o.description}</span>}
              </button>
            )
          })}
        </div>
        {q.freeText && (
          <input
            className="field field--inline"
            type="text"
            placeholder={q.freeText.placeholder}
            maxLength={140}
            value={value?.text ?? ''}
            onChange={(e) => onChange({ selected, text: e.target.value })}
          />
        )}
      </div>
    </div>
  )
}
