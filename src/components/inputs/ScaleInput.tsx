import type { ScaleQuestion } from '../../questionnaire/types'

interface Props {
  q: ScaleQuestion
  value: number | undefined
  onChange: (v: number) => void
}

export function ScaleInput({ q, value, onChange }: Props) {
  const steps = Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i)
  return (
    <div className="q__body">
      <div className="scale" role="radiogroup">
        {steps.map((n, i) => {
          const on = value === n
          const emoji = q.stepEmojis?.[i]
          const label = q.stepLabels?.[i]
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={on}
              className={`scale__step${on ? ' scale__step--on' : ''}`}
              onClick={() => onChange(n)}
            >
              {emoji ? <span className="scale__emoji">{emoji}</span> : <span className="scale__num">{n}</span>}
              {label && <span className="scale__label">{label}</span>}
            </button>
          )
        })}
      </div>
      {q.poles && (
        <div className="poles">
          <span>{q.poles[0]}</span>
          <span>{q.poles[1]}</span>
        </div>
      )}
    </div>
  )
}
