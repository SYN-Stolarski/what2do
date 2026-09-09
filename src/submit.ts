import type { Export } from './questionnaire/export'

/**
 * Transport for finished questionnaires.
 *
 * v0.1 has no backend yet: submissions are only marked locally so the flow
 * can be tested end to end. Swap the body of `submitAnswers` for a POST to
 * the collection endpoint once one exists; the export shape stays the same.
 */
export async function submitAnswers(payload: Export): Promise<void> {
  try {
    localStorage.setItem('what2do.v2.submitted', JSON.stringify({ at: new Date().toISOString(), payload }))
  } catch {
    /* storage unavailable: nothing to do in v0.1 */
  }
}
