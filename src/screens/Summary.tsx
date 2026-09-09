import { useState } from 'react'
import { Button } from '../components/Button'
import { buildExport } from '../questionnaire/export'
import { formatAnswer, isAnswered } from '../questionnaire/logic'
import type { Answers, Question } from '../questionnaire/types'
import { submitAnswers } from '../submit'

interface Props {
  questions: Question[]
  answers: Answers
  onEdit: (index: number) => void
  onSubmitted: () => void
}

export function Summary({ questions, answers, onEdit, onSubmitted }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await submitAnswers(buildExport(answers))
      onSubmitted()
    } catch {
      setError('Senden hat nicht geklappt. Bitte noch einmal versuchen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <main className="main">
        <section className="q">
          <div className="q__meta mono">
            <span>Deine Antworten</span>
            <span>{questions.length} Fragen</span>
          </div>
          <h1 className="q__title">Passt das so?</h1>
          <p className="q__hint">Tippe auf eine Antwort, um sie zu ändern. Danach schickst du alles an den Host.</p>
          <div className="summary">
            {questions.map((q, i) => {
              const answered = isAnswered(q, answers[q.id])
              return (
                <button key={q.id} type="button" className="row" onClick={() => onEdit(i)}>
                  <span className="row__idx mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="row__text">
                    <span className="row__label mono">{q.label}</span>
                    <span className={`row__value${answered ? '' : ' row__value--empty'}`}>
                      {answered ? formatAnswer(q, answers[q.id]) : q.required ? 'Fehlt noch' : 'Übersprungen'}
                    </span>
                  </span>
                  <span className="row__edit mono">Ändern</span>
                </button>
              )
            })}
          </div>
          {error && <p className="q__hint">{error}</p>}
        </section>
      </main>
      <footer className="footer">
        <Button arrow onClick={submit} disabled={busy}>
          {busy ? 'Wird gesendet …' : 'An den Host senden'}
        </Button>
      </footer>
    </>
  )
}
