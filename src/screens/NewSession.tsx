import { useState } from 'react'
import type { FormEvent } from 'react'
import { createSession, type SessionContext } from '../api'
import { Button } from '../components/Button'
import { backendConfigured } from '../config'
import { hostPath, navigate } from '../router'
import { rememberHostSession, listHostSessions } from '../state/hostSessions'

export function NewSession() {
  const [title, setTitle] = useState('')
  const [ctx, setCtx] = useState<SessionContext>({ place: 'Duisburg' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mine = listHostSessions()

  const set = (k: keyof SessionContext) => (v: string) => setCtx((c) => ({ ...c, [k]: v }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    setError(null)
    try {
      const clean: SessionContext = Object.fromEntries(
        Object.entries(ctx)
          .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
          .filter(([, v]) => v),
      )
      const { id, hostToken } = await createSession(title.trim(), clean)
      rememberHostSession({ id, title: title.trim(), hostToken, createdAt: new Date().toISOString() })
      navigate(hostPath(id, hostToken))
    } catch (e) {
      setError(`Anlegen hat nicht geklappt: ${e instanceof Error ? e.message : 'unbekannter Fehler'}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <form className="main" onSubmit={submit}>
        <section className="q">
          <div className="q__meta mono">
            <span>what2do · Host</span>
            <span>Neuer Abend</span>
          </div>
          <h1 className="q__title">Einen Abend anlegen.</h1>
          <p className="q__hint">
            Du bekommst einen Link zum Verteilen und einen geheimen Host-Link, unter dem die Antworten landen.
          </p>
          {!backendConfigured && <p className="q__hint">Kein Backend konfiguriert. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_KEY setzen.</p>}

          <div className="form">
            <label className="form__field">
              <span className="mono">Titel</span>
              <input className="field" required maxLength={80} placeholder="z. B. Freitag bei Chris" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <div className="form__grid">
              <label className="form__field">
                <span className="mono">Datum</span>
                <input className="field field--sm" type="date" value={ctx.date ?? ''} onChange={(e) => set('date')(e.target.value)} />
              </label>
              <label className="form__field">
                <span className="mono">Start</span>
                <input className="field field--sm" type="time" value={ctx.time ?? ''} onChange={(e) => set('time')(e.target.value)} />
              </label>
            </div>
            <label className="form__field">
              <span className="mono">Ort</span>
              <input className="field field--sm" maxLength={80} value={ctx.place ?? ''} onChange={(e) => set('place')(e.target.value)} />
            </label>
            <div className="form__grid">
              <label className="form__field">
                <span className="mono">Wetter</span>
                <input className="field field--sm" maxLength={40} placeholder="z. B. trocken, 14 °C" value={ctx.weather ?? ''} onChange={(e) => set('weather')(e.target.value)} />
              </label>
              <label className="form__field">
                <span className="mono">Wie viele</span>
                <input className="field field--sm" inputMode="numeric" maxLength={3} placeholder="z. B. 5" value={ctx.group_size ?? ''} onChange={(e) => set('group_size')(e.target.value)} />
              </label>
            </div>
            <label className="form__field">
              <span className="mono">Besonderheiten</span>
              <textarea className="field field--sm" rows={2} maxLength={280} placeholder="Autos, Kinder, Geburtstag, …" value={ctx.notes ?? ''} onChange={(e) => set('notes')(e.target.value)} />
            </label>
          </div>
          {error && <p className="q__hint">{error}</p>}

          {mine.length > 0 && (
            <div className="summary">
              <div className="q__meta mono" style={{ padding: '12px 0 4px' }}>
                <span>Deine Abende auf diesem Gerät</span>
              </div>
              {mine.map((s) => (
                <a key={s.id} className="row row--link" href={hostPath(s.id, s.hostToken)}>
                  <span className="row__idx mono">{s.id.slice(0, 4)}</span>
                  <span className="row__text">
                    <span className="row__label mono">{new Date(s.createdAt).toLocaleDateString('de-DE')}</span>
                    <span className="row__value">{s.title}</span>
                  </span>
                  <span className="row__edit mono">Öffnen</span>
                </a>
              ))}
            </div>
          )}
        </section>
        <footer className="footer">
          <Button arrow type="submit" disabled={busy || !title.trim() || !backendConfigured}>
            {busy ? 'Wird angelegt …' : 'Abend anlegen'}
          </Button>
        </footer>
      </form>
    </div>
  )
}
