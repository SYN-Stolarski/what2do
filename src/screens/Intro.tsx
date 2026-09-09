import { Button } from '../components/Button'

interface Props {
  total: number
  hasProgress: boolean
  onStart: () => void
  onContinue: () => void
  onReset: () => void
}

export function Intro({ total, hasProgress, onStart, onContinue, onReset }: Props) {
  return (
    <>
      <main className="main">
        <div className="hero">
          <div className="hero__kicker mono">
            <span>what2do</span>
            <span>Blatt 00</span>
          </div>
          <h1 className="hero__title">Was machen wir heute Abend?</h1>
          <p className="hero__lead">
            Ein paar schnelle Fragen zu deiner Laune und deinen Wünschen. Danach finden wir etwas, das allen passt.
          </p>
          <div className="spec">
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
