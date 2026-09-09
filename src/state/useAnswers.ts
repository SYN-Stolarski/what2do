import { useCallback, useEffect, useState } from 'react'
import type { AnswerValue, Answers } from '../questionnaire/types'

export type Screen = 'intro' | 'question' | 'summary'

interface Persisted {
  answers: Answers
  step: number
  screen: Screen
}

const KEY = 'what2do.v2'

function load(): Persisted | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Persisted>
    if (!parsed || typeof parsed !== 'object') return null
    return {
      answers: parsed.answers ?? {},
      step: typeof parsed.step === 'number' ? parsed.step : 0,
      screen: parsed.screen === 'question' || parsed.screen === 'summary' ? parsed.screen : 'intro',
    }
  } catch {
    return null
  }
}

function save(p: Persisted) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable: run in memory only */
  }
}

export function useAnswers() {
  const [state, setState] = useState<Persisted>(() => load() ?? { answers: {}, step: 0, screen: 'intro' })

  useEffect(() => {
    save(state)
  }, [state])

  const setAnswer = useCallback((id: string, value: AnswerValue | undefined) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: value } }))
  }, [])

  const setStep = useCallback((step: number) => setState((s) => ({ ...s, step })), [])
  const setScreen = useCallback((screen: Screen) => setState((s) => ({ ...s, screen })), [])
  const go = useCallback((screen: Screen, step: number) => setState((s) => ({ ...s, screen, step })), [])

  const reset = useCallback(() => {
    setState({ answers: {}, step: 0, screen: 'intro' })
  }, [])

  const hasProgress = Object.values(state.answers).some((v) => v !== undefined)

  return { ...state, hasProgress, setAnswer, setStep, setScreen, go, reset }
}
