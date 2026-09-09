interface Props {
  step: number
  total: number
  blockLabel?: string
  onBack?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

export function TopBar({ step, total, blockLabel, onBack }: Props) {
  return (
    <header>
      <div className="topbar">
        <button type="button" className="topbar__back mono" onClick={onBack} disabled={!onBack}>
          ← Zurück
        </button>
        <div className="topbar__block mono">{blockLabel ?? ''}</div>
        <div className="topbar__count mono">
          {pad(Math.min(step + 1, total))} / {pad(total)}
        </div>
      </div>
      <div className="ruler" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={step}>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`ruler__tick${i < step ? ' ruler__tick--on' : ''}${i === step ? ' ruler__tick--now' : ''}`}
          />
        ))}
      </div>
    </header>
  )
}
