import { submitResponse } from './api'
import { cleanAnswers } from './questionnaire/export'
import { NICKNAME_ID, SCHEMA_VERSION } from './questionnaire/schema'
import type { Answers } from './questionnaire/types'

/** Send a finished questionnaire to the collection backend. */
export async function submitAnswers(sessionId: string, answers: Answers): Promise<void> {
  const nick = answers[NICKNAME_ID]
  const nickname = typeof nick === 'string' ? nick.trim() : ''
  await submitResponse(sessionId, nickname, SCHEMA_VERSION, cleanAnswers(answers))
}
