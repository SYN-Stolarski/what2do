interface Props {
  step: number
  total: number
  onBack?: () => void
}

export function TopBar({ step, total, onBack }: Props) {
  const pct = Math.round((step / total) * 100)
  return (
    <header className="topbar">
      <button type="button" className="topbar__back" onClick={onBack} disabled={!onBack} aria-label="Zurück">
        ←
      </button>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={step}>
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="topbar__count">
        {Math.min(step + 1, total)}/{total}
      </div>
    </header>
  )
}
