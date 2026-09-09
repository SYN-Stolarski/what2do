import type { SingleQuestion } from '../../questionnaire/types'

interface Props {
  q: SingleQuestion
  value: string | undefined
  onChange: (v: string) => void
}

export function SingleChoice({ q, value, onChange }: Props) {
  return (
    <div className="q__body" role="radiogroup">
      {q.options.map((o) => {
        const on = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            className={`opt${on ? ' opt--on' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.emoji && <span className="opt__emoji">{o.emoji}</span>}
            <span className="opt__text">
              <span className="opt__label">{o.label}</span>
              {o.description && <span className="opt__desc">{o.description}</span>}
            </span>
            <span className="opt__mark">{on ? '✓' : ''}</span>
          </button>
        )
      })}
    </div>
  )
}
