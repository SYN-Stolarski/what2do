import { toggleRank } from '../../questionnaire/logic'
import type { RankQuestion } from '../../questionnaire/types'

interface Props {
  q: RankQuestion
  value: string[] | undefined
  onChange: (v: string[]) => void
}

export function RankInput({ q, value, onChange }: Props) {
  const order = value ?? []
  return (
    <div className="q__body">
      <div className="sheet">
        {q.options.map((o) => {
          const pos = order.indexOf(o.value)
          const on = pos >= 0
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              className={`opt${on ? ' opt--on' : ''}`}
              onClick={() => onChange(toggleRank(order, o.value))}
            >
              <span className="rank__badge">{on ? pos + 1 : '·'}</span>
              <span className="opt__text">
                <span className="opt__label">{o.label}</span>
                {o.description && <span className="opt__desc">{o.description}</span>}
              </span>
            </button>
          )
        })}
      </div>
      {order.length > 0 && (
        <button type="button" className="btn btn--ghost" onClick={() => onChange([])}>
          Reihenfolge zurücksetzen
        </button>
      )}
    </div>
  )
}
