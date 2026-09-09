import type { Session } from '../api'
import { Button } from '../components/Button'

interface Props {
  session: Session
  total: number
  hasProgress: boolean
  onStart: () => void
  onContinue: () => void
  onReset: () => void
}

function when(session: Session): string | null {
  const { date, time } = session.context
  if (!date && !time) return null
  const d = date ? new Date(`${date}T12:00:00`) : null
  const ds = d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }) : date
  return [ds, time].filter(Boolean).join(', ')
}

export function Intro({ session, total, hasProgress, onStart, onContinue, onReset }: Props) {
  const w = when(session)
  return (
    <>
      <main className="main">
        <div className="hero">
          <div className="hero__kicker mono">
            <span>what2do</span>
            <span>Blatt 00</span>
          </div>
          <h1 className="hero__title">{session.title}</h1>
          <p className="hero__lead">
            Ein paar schnelle Fragen zu deiner Laune und deinen Wünschen. Danach finden wir etwas, das allen passt.
          </p>
          <div className="spec">
            {w && (
              <div className="spec__row">
                <span className="mono">Wann</span>
                <span>{w}</span>
              </div>
            )}
            {session.context.place && (
              <div className="spec__row">
                <span className="mono">Wo</span>
                <span>{session.context.place}</span>
              </div>
            )}
            <div className="spec__row">
              <span className="mono">Dauer</span>
              <span>ca. 3 Minuten</span>
            </div>
            <div className="spec__row">
              <span className="mono">Umfang</span>
              <span>{total} Fragen</span>
            </div>
            <div className="spec__row">
              <span className="mono">Sichtbar für</span>
              <span>nur den Host</span>
            </div>
          </div>
        </div>
      </main>
      <footer className="footer">
        {hasProgress ? (
          <>
            <Button arrow onClick={onContinue}>
              Weitermachen
            </Button>
            <Button variant="ghost" onClick={onReset}>
              Von vorn anfangen
            </Button>
          </>
        ) : (
          <Button arrow onClick={onStart}>
            Los geht’s
          </Button>
        )}
      </footer>
    </>
  )
}
