export interface HostSessionRef {
  id: string
  title: string
  hostToken: string
  createdAt: string
}

const KEY = 'what2do.host.sessions'

export function listHostSessions(): HostSessionRef[] {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? (JSON.parse(raw) as HostSessionRef[]) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function rememberHostSession(ref: HostSessionRef): void {
  try {
    const rest = listHostSessions().filter((s) => s.id !== ref.id)
    localStorage.setItem(KEY, JSON.stringify([ref, ...rest].slice(0, 20)))
  } catch {
    /* storage unavailable */
  }
}
