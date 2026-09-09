import { useEffect, useState } from 'react'
import { getSession, type Session } from './api'
import { parseRoute, type Route } from './router'
import { Host } from './screens/Host'
import { NewSession } from './screens/NewSession'
import { Participant } from './screens/Participant'

function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))
  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export default function App() {
  const route = useRoute()
  switch (route.kind) {
    case 'new':
      return <NewSession />
    case 'host':
      return <Host key={route.sessionId} sessionId={route.sessionId} hostToken={route.hostToken} />
    case 'participant':
      return <ParticipantLoader key={route.sessionId} sessionId={route.sessionId} />
    case 'unknown':
      return <Missing message="Diese Seite gibt es nicht." />
  }
}

function ParticipantLoader({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<{ kind: 'loading' } | { kind: 'ready'; session: Session } | { kind: 'missing' } | { kind: 'error'; message: string }>({
    kind: 'loading',
  })
  useEffect(() => {
    let alive = true
    getSession(sessionId)
      .then((s) => alive && setState(s ? { kind: 'ready', session: s } : { kind: 'missing' }))
      .catch((e: unknown) => alive && setState({ kind: 'error', message: e instanceof Error ? e.message : 'Fehler' }))
    return () => {
      alive = false
    }
  }, [sessionId])

  if (state.kind === 'loading') {
    return (
      <div className="app">
        <main className="main">
          <p className="q__hint">Lade …</p>
        </main>
      </div>
    )
  }
  if (state.kind === 'missing') return <Missing message="Diesen Abend gibt es nicht. Prüf den Link." />
  if (state.kind === 'error') return <Missing message={`Verbindung fehlgeschlagen: ${state.message}`} />
  return <Participant session={state.session} />
}

function Missing({ message }: { message: string }) {
  return (
    <div className="app">
      <main className="main">
        <section className="q">
          <div className="q__meta mono">
            <span>what2do</span>
          </div>
          <h1 className="q__title">{message}</h1>
        </section>
      </main>
    </div>
  )
}
