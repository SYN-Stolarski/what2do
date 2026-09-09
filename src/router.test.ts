import { describe, expect, it } from 'vitest'
import { absoluteUrl, hostPath, parseRoute, participantPath } from './router'

describe('router', () => {
  it('parses the landing page', () => {
    expect(parseRoute('')).toEqual({ kind: 'new' })
    expect(parseRoute('#')).toEqual({ kind: 'new' })
    expect(parseRoute('#/')).toEqual({ kind: 'new' })
  })
  it('parses participant and host routes', () => {
    expect(parseRoute('#/s/ab12cd34')).toEqual({ kind: 'participant', sessionId: 'ab12cd34' })
    expect(parseRoute('#/host/ab12cd34/deadbeef')).toEqual({ kind: 'host', sessionId: 'ab12cd34', hostToken: 'deadbeef' })
    expect(parseRoute('#/host/ab12cd34')).toEqual({ kind: 'unknown' })
    expect(parseRoute('#/nope')).toEqual({ kind: 'unknown' })
  })
  it('round-trips through the path builders', () => {
    expect(parseRoute(participantPath('x y'))).toEqual({ kind: 'participant', sessionId: 'x y' })
    expect(parseRoute(hostPath('id', 'tok/en'))).toEqual({ kind: 'host', sessionId: 'id', hostToken: 'tok/en' })
  })
  it('builds absolute share urls on the page location', () => {
    expect(absoluteUrl('#/s/abc', 'https://syn-stolarski.github.io/what2do/#/host/abc/tok')).toBe(
      'https://syn-stolarski.github.io/what2do/#/s/abc',
    )
  })
})
