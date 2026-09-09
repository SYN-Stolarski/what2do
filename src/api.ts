import { SUPABASE_KEY, SUPABASE_URL } from './config'

export interface SessionContext {
  date?: string
  time?: string
  place?: string
  weather?: string
  group_size?: string
  notes?: string
}

export interface Session {
  id: string
  title: string
  context: SessionContext
  created_at: string
}

export interface ResponseRow {
  id: string
  session_id: string
  nickname: string
  schema_version: string
  answers: Record<string, unknown>
  submitted_at: string
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  }
  if (init.prefer) headers.Prefer = init.prefer
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers })
  if (!res.ok) {
    let msg = res.statusText
    try {
      const body = (await res.json()) as { message?: string; hint?: string }
      msg = body.message ?? msg
    } catch {
      /* no JSON body */
    }
    throw new ApiError(res.status, msg)
  }
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function createSession(title: string, context: SessionContext): Promise<{ id: string; hostToken: string }> {
  const rows = await request<{ session_id: string; host_token: string }[]>('rpc/create_session', {
    method: 'POST',
    body: JSON.stringify({ p_title: title, p_context: context }),
  })
  const row = rows[0]
  if (!row) throw new ApiError(500, 'create_session returned no row')
  return { id: row.session_id, hostToken: row.host_token }
}

export async function getSession(id: string): Promise<Session | null> {
  const rows = await request<Session[]>(`sessions?id=eq.${encodeURIComponent(id)}&select=id,title,context,created_at`)
  return rows[0] ?? null
}

export async function submitResponse(
  sessionId: string,
  nickname: string,
  schemaVersion: string,
  answers: Record<string, unknown>,
): Promise<void> {
  await request<void>('responses', {
    method: 'POST',
    prefer: 'return=minimal',
    body: JSON.stringify({ session_id: sessionId, nickname, schema_version: schemaVersion, answers }),
  })
}

export async function hostResponses(sessionId: string, hostToken: string): Promise<ResponseRow[]> {
  return request<ResponseRow[]>('rpc/host_responses', {
    method: 'POST',
    body: JSON.stringify({ p_session: sessionId, p_token: hostToken }),
  })
}

export async function hostDeleteResponse(sessionId: string, hostToken: string, responseId: string): Promise<void> {
  await request<void>('rpc/host_delete_response', {
    method: 'POST',
    body: JSON.stringify({ p_session: sessionId, p_token: hostToken, p_response: responseId }),
  })
}
