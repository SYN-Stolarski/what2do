import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { buildExport } from '../questionnaire/export'
import { formatAnswer, isAnswered } from '../questionnaire/logic'
import type { Answers, Question } from '../questionnaire/types'

interface Props {
  questions: Question[]
  answers: Answers
  onEdit: (index: number) => void
  onReset: () => void
}

export function Summary({ questions, answers, onEdit, onReset }: Props) {
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const json = () => JSON.stringify(buildExport(answers), null, 2)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json())
      setToast('Kopiert ✓')
    } catch {
      setToast('Kopieren nicht möglich')
    }
  }

  const download = () => {
    const blob = new Blob([json()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const nick = String(answers.q00_nickname ?? 'antworten').replace(/[^\w-]+/g, '_')
    a.href = url
    a.download = `what2do-${nick}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <main className="main">
        <section className="q">
          <div className="q__meta mono">
            <span>Zusammenfassung</span>
            <span>{questions.length} Antworten</span>
          </div>
          <h1 className="q__title">Fertig. Passt alles?</h1>
          <p className="q__hint">Tippe auf eine Antwort, um sie zu ändern.</p>
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
        </section>
      </main>
      <footer className="footer">
        <Button arrow onClick={copy}>
          Antworten kopieren
        </Button>
        <Button variant="secondary" onClick={download}>
          Als JSON herunterladen
        </Button>
        <Button variant="ghost" danger onClick={onReset}>
          Alles löschen und von vorn
        </Button>
      </footer>
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
