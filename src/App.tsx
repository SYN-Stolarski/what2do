import { useCallback, useEffect, useRef } from 'react'
import { Button } from './components/Button'
import { TopBar } from './components/TopBar'
import { QuestionView } from './components/QuestionView'
import { Intro } from './screens/Intro'
import { Summary } from './screens/Summary'
import { Done } from './screens/Done'
import { NICKNAME_ID, blockNames, questions } from './questionnaire/schema'
import { canProceed, firstMissingIndex, isEmpty } from './questionnaire/logic'
import type { AnswerValue } from './questionnaire/types'
import { useAnswers } from './state/useAnswers'

const AUTO_ADVANCE_MS = 280

export default function App() {
  const { answers, step, screen, hasProgress, setAnswer, go, reset } = useAnswers()
  const timer = useRef<number | null>(null)

  const total = questions.length
  const q = questions[Math.min(step, total - 1)]
  const value = answers[q.id]

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step, screen])

  useEffect(() => () => clearTimer(), [])

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  const finish = useCallback(() => {
    const missing = firstMissingIndex(questions, answers)
    if (missing >= 0) go('question', missing)
    else go('summary', total)
  }, [answers, go, total])

  const next = useCallback(() => {
    clearTimer()
    if (!canProceed(q, answers[q.id])) return
    if (step + 1 >= total) finish()
    else go('question', step + 1)
  }, [q, answers, step, total, go, finish])

  const back = () => {
    clearTimer()
    if (step === 0) go('intro', 0)
    else go('question', step - 1)
  }

  const onChange = (v: AnswerValue) => {
    setAnswer(q.id, v)
    if (q.type === 'single' || q.type === 'scale') {
      clearTimer()
      timer.current = window.setTimeout(() => {
        timer.current = null
        if (step + 1 >= total) go('summary', total)
        else go('question', step + 1)
      }, AUTO_ADVANCE_MS)
    }
  }

  const confirmReset = () => {
    if (window.confirm('Alle Antworten löschen?')) reset()
  }

  if (screen === 'intro') {
    return (
      <div className="app">
        <Intro
          total={total}
          hasProgress={hasProgress}
          onStart={() => go('question', 0)}
          onContinue={() => go('question', Math.min(step, total - 1))}
          onReset={confirmReset}
        />
      </div>
    )
  }

  if (screen === 'summary') {
    return (
      <div className="app">
        <TopBar step={total} total={total} blockLabel="Fertig" onBack={() => go('question', total - 1)} />
        <Summary
          questions={questions}
          answers={answers}
          onEdit={(i) => go('question', i)}
          onSubmitted={() => go('done', total)}
        />
      </div>
    )
  }

  if (screen === 'done') {
    const nick = answers[NICKNAME_ID]
    return (
      <div className="app">
        <Done
          nickname={typeof nick === 'string' && nick.trim() ? nick.trim() : 'dir'}
          onReview={() => go('summary', total)}
          onReset={confirmReset}
        />
      </div>
    )
  }

  const ok = canProceed(q, value)
  const last = step + 1 >= total
  const skippable = !q.required && isEmpty(q, value)

  return (
    <div className="app">
      <TopBar step={step} total={total} blockLabel={blockNames[q.block]} onBack={back} />
      <main className="main">
        <QuestionView q={q} index={step} value={value} onChange={onChange} onSubmit={next} />
      </main>
      <footer className="footer">
        <Button arrow onClick={next} disabled={!ok}>
          {last ? 'Fertig' : skippable ? 'Überspringen' : 'Weiter'}
        </Button>
      </footer>
    </div>
  )
}
