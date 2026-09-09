import { Button } from '../components/Button'

interface Props {
  nickname: string
  onReview: () => void
  onReset: () => void
}

export function Done({ nickname, onReview, onReset }: Props) {
  return (
    <>
      <main className="main">
        <div className="hero">
          <div className="hero__kicker mono">
            <span>what2do</span>
            <span>Abgegeben</span>
          </div>
          <h1 className="hero__title">Danke, {nickname}.</h1>
          <p className="hero__lead">
            Deine Antworten sind beim Host. Sobald alle durch sind, gibt es einen Vorschlag für den Abend. Du kannst
            die Seite jetzt schließen.
          </p>
        </div>
      </main>
      <footer className="footer">
        <Button variant="secondary" onClick={onReview}>
          Antworten noch einmal ansehen
        </Button>
        <Button variant="ghost" danger onClick={onReset}>
          Alles löschen und von vorn
        </Button>
      </footer>
    </>
  )
}
