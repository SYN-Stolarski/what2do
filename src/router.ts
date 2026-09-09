/**
 * Hash routing, so the app works on GitHub Pages without server rewrites.
 *   #/                      host landing: create an evening
 *   #/s/<sessionId>         participant questionnaire
 *   #/host/<sessionId>/<token>  host view: share link, responses, export
 */
export type Route =
  | { kind: 'new' }
  | { kind: 'participant'; sessionId: string }
  | { kind: 'host'; sessionId: string; hostToken: string }
  | { kind: 'unknown' }

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/^\/+/, '').replace(/\/+$/, '')
  if (path === '') return { kind: 'new' }
  const parts = path.split('/').map(decodeURIComponent)
  if (parts[0] === 's' && parts[1]) return { kind: 'participant', sessionId: parts[1] }
  if (parts[0] === 'host' && parts[1] && parts[2]) return { kind: 'host', sessionId: parts[1], hostToken: parts[2] }
  return { kind: 'unknown' }
}

export function participantPath(sessionId: string): string {
  return `#/s/${encodeURIComponent(sessionId)}`
}

export function hostPath(sessionId: string, hostToken: string): string {
  return `#/host/${encodeURIComponent(sessionId)}/${encodeURIComponent(hostToken)}`
}

/** Absolute URL for sharing, based on the current page location. */
export function absoluteUrl(hashPath: string, base: string = window.location.href): string {
  const u = new URL(base)
  u.hash = hashPath
  return u.toString()
}

export function navigate(hashPath: string): void {
  window.location.hash = hashPath
}
