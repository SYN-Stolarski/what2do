import { useCallback, useEffect, useState } from 'react'
import { ApiError, getSession, hostDeleteResponse, hostResponses, type ResponseRow, type Session } from '../api'
import { Button } from '../components/Button'
import { APP_VERSION } from '../config'
import { buildHostExport } from '../questionnaire/export'
import { formatAnswer } from '../questionnaire/logic'
import { questions } from '../questionnaire/schema'
import type { AnswerValue } from '../questionnaire/types'
import { absoluteUrl, participantPath } from '../router'
import { rememberHostSession } from '../state/hostSessions'

interface Props {
  sessionId: string
  hostToken: string
}

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; session: Session; responses: ResponseRow[]; fetchedAt: Date }

export function Host({ sessionId, hostToken }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [open, setOpen] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [session, responses] = await Promise.all([getSession(sessionId), hostResponses(sessionId, hostToken)])
      if (!session) {
        setState({ kind: 'error', message: 'Diesen Abend gibt es nicht.' })
        return
      }
      rememberHostSession({ id: session.id, title: session.title, hostToken, createdAt: session.created_at })
      setState({ kind: 'ready', session, responses, fetchedAt: new Date() })
    } catch (e) {
      const msg = e instanceof ApiError && e.status === 401 ? 'Host-Link ungültig.' : e instanceof Error ? e.message : 'Fehler'
      setState({ kind: 'error', message: msg })
    }
  }, [sessionId, hostToken])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const shareUrl = absoluteUrl(participantPath(sessionId))

  const share = async () => {
    const text = state.kind === 'ready' ? `${state.session.title}: ${shareUrl}` : shareUrl
    try {
      if (navigator.share) {
        await navigator.share({ title: 'what2do', text, url: shareUrl })
        return
      }
      await navigator.clipboard.writeText(shareUrl)
      setToast('Link kopiert ✓')
    } catch {
      /* user cancelled the share sheet */
    }
  }

  const exportJson = () => {
    if (state.kind !== 'ready') return ''
    const { session, responses } = state
    return JSON.stringify(
      buildHostExport(
        { id: session.id, title: session.title, context: session.context as Record<string, unknown>, created_at: session.created_at },
        responses,
        {
        appVersion: APP_VERSION,
      }),
      null,
      2,
    )
  }

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportJson())
      setToast('Export kopiert ✓')
    } catch {
      setToast('Kopieren nicht möglich')
    }
  }

  const downloadExport = () => {
    if (state.kind !== 'ready') return
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `what2do-${state.session.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const remove = async (r: ResponseRow) => {
    if (!window.confirm(`Antwort von ${r.nickname} löschen?`)) return
    try {
      await hostDeleteResponse(sessionId, hostToken, r.id)
      await load()
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Löschen fehlgeschlagen')
    }
  }

  if (state.kind === 'loading') {
    return (
      <div className="app">
        <main className="main">
          <p className="q__hint">Lade …</p>
        </main>
      </div>
    )
  }
  if (state.kind === 'error') {
    return (
      <div className="app">
        <main className="main">
          <section className="q">
            <div className="q__meta mono">
              <span>what2do · Host</span>
            </div>
            <h1 className="q__title">{state.message}</h1>
            <p className="q__hint">
              <a href="#/">Neuen Abend anlegen</a>
            </p>
          </section>
        </main>
      </div>
    )
  }

  const { session, responses, fetchedAt } = state
  return (
    <div className="app">
      <main className="main">
        <section className="q">
          <div className="q__meta mono">
            <span>what2do · Host</span>
            <span>{session.id}</span>
          </div>
          <h1 className="q__title">{session.title}</h1>
          <p className="q__hint">
            {responses.length === 0
              ? 'Noch keine Antworten. Verteile den Link.'
              : `${responses.length} ${responses.length === 1 ? 'Antwort' : 'Antworten'} · Stand ${fetchedAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`}
          </p>

          <div className="sheet share">
            <div className="share__label mono">Link für die Teilnehmenden</div>
            <div className="share__url">{shareUrl}</div>
          </div>
          <div className="btn-row">
            <Button variant="secondary" onClick={share}>
              Link teilen
            </Button>
            <Button variant="secondary" onClick={() => void load()}>
              Aktualisieren
            </Button>
          </div>

          <div className="summary">
            {responses.map((r, i) => {
              const isOpen = open === r.id
              return (
                <div key={r.id} className="resp">
                  <button type="button" className="row" onClick={() => setOpen(isOpen ? null : r.id)}>
                    <span className="row__idx mono">{String(i + 1).padStart(2, '0')}</span>
                    <span className="row__text">
                      <span className="row__label mono">
                        {new Date(r.submitted_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="row__value">{r.nickname}</span>
                    </span>
                    <span className="row__edit mono">{isOpen ? 'Zu' : 'Ansehen'}</span>
                  </button>
                  {isOpen && (
                    <div className="resp__body">
                      {questions.slice(1).map((q) => (
                        <div key={q.id} className="resp__line">
                          <span className="mono">{q.label}</span>
                          <span>{formatAnswer(q, r.answers[q.id] as AnswerValue | undefined)}</span>
                        </div>
                      ))}
                      <button type="button" className="btn btn--ghost btn--danger" onClick={() => void remove(r)}>
                        Diese Antwort löschen
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </main>
      <footer className="footer">
        <Button arrow onClick={copyExport} disabled={responses.length === 0}>
          Export kopieren
        </Button>
        <Button variant="secondary" onClick={downloadExport} disabled={responses.length === 0}>
          Export als JSON herunterladen
        </Button>
      </footer>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
