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
          <div className="hero__emoji" aria-hidden="true">
            🎲
          </div>
          <h1 className="hero__title">Was machen wir heute Abend?</h1>
          <p className="hero__lead">
            Ein paar schnelle Fragen zu deiner Laune und deinen Wünschen. Danach finden wir gemeinsam was, das
            allen passt.
          </p>
          <div className="hero__meta">
            <span className="pill">⏱️ ca. 3 Minuten</span>
            <span className="pill">❓ {total} Fragen</span>
            <span className="pill">🔒 nur der Host sieht’s</span>
          </div>
        </div>
      </main>
      <footer className="footer">
        {hasProgress ? (
          <>
            <Button onClick={onContinue}>Weitermachen</Button>
            <Button variant="ghost" onClick={onReset}>
              Von vorn anfangen
            </Button>
          </>
        ) : (
          <Button onClick={onStart}>Los geht’s</Button>
        )}
      </footer>
    </>
  )
}
