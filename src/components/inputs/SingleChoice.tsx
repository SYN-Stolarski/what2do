import type { SingleQuestion } from '../../questionnaire/types'

interface Props {
  q: SingleQuestion
  value: string | undefined
  onChange: (v: string) => void
}

export function SingleChoice({ q, value, onChange }: Props) {
  return (
    <div className="q__body">
      <div className="sheet" role="radiogroup">
        {q.options.map((o, i) => {
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
              <span className="opt__idx">{String(i + 1).padStart(2, '0')}</span>
              <span className="opt__text">
                <span className="opt__label">{o.label}</span>
                {o.description && <span className="opt__desc">{o.description}</span>}
              </span>
              <span className="opt__mark opt__mark--round" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
