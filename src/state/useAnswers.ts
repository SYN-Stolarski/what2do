import { useCallback, useEffect, useState } from 'react'
import type { AnswerValue, Answers } from '../questionnaire/types'

export type Screen = 'intro' | 'question' | 'summary' | 'done'

interface Persisted {
  answers: Answers
  step: number
  screen: Screen
}

const SCREENS: Screen[] = ['intro', 'question', 'summary', 'done']

function key(sessionId: string) {
  return `what2do.v2.${sessionId}`
}

function load(sessionId: string): Persisted | null {
  try {
    const raw = localStorage.getItem(key(sessionId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Persisted>
    if (!parsed || typeof parsed !== 'object') return null
    return {
      answers: parsed.answers ?? {},
      step: typeof parsed.step === 'number' ? parsed.step : 0,
      screen: SCREENS.includes(parsed.screen as Screen) ? (parsed.screen as Screen) : 'intro',
    }
  } catch {
    return null
  }
}

function save(sessionId: string, p: Persisted) {
  try {
    localStorage.setItem(key(sessionId), JSON.stringify(p))
  } catch {
    /* storage unavailable: run in memory only */
  }
}

export function useAnswers(sessionId: string) {
  const [state, setState] = useState<Persisted>(() => load(sessionId) ?? { answers: {}, step: 0, screen: 'intro' })

  useEffect(() => {
    save(sessionId, state)
  }, [sessionId, state])

  const setAnswer = useCallback((id: string, value: AnswerValue | undefined) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: value } }))
  }, [])

  const go = useCallback((screen: Screen, step: number) => setState((s) => ({ ...s, screen, step })), [])

  const reset = useCallback(() => {
    setState({ answers: {}, step: 0, screen: 'intro' })
  }, [])

  const hasProgress = Object.values(state.answers).some((v) => v !== undefined)

  return { ...state, hasProgress, setAnswer, go, reset }
}
