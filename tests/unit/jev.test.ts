import { afterEach, describe, expect, it, vi } from 'vitest'
import handler from '../../api/jev'

const TYPESAFE_URL = 'https://api.typesafe.ai/v1/systemone'

type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

function postRequest(body: string, authorization?: string): Request {
  return new Request('https://jevprompting.vercel.app/api/jev', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(authorization ? { authorization } : {}) },
    body,
  })
}

function stubFetch(response: Response) {
  const fetchMock = vi.fn<FetchFn>(async () => response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('api/jev proxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('reenvía cuerpo y Authorization del usuario a TypeSafe', async () => {
    const fetchMock = stubFetch(new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } }))

    const response = await handler(postRequest('{"state":{"prompt":"hola"}}', 'Bearer user-key'))

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(TYPESAFE_URL)
    expect(init?.method).toBe('POST')
    expect((init?.headers as Record<string, string>).authorization).toBe('Bearer user-key')
    expect(init?.body).toBe('{"state":{"prompt":"hola"}}')
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('{"ok":true}')
  })

  it('usa TYPESAFE_API_KEY como fallback cuando no hay header', async () => {
    const fetchMock = stubFetch(new Response('{}', { status: 200 }))
    vi.stubEnv('TYPESAFE_API_KEY', 'server-key')

    await handler(postRequest('{}'))

    const [, init] = fetchMock.mock.calls[0]
    expect((init?.headers as Record<string, string>).authorization).toBe('Bearer server-key')
  })

  it('propaga el status de error del upstream', async () => {
    stubFetch(new Response('{"detail":{"message":"bad key"}}', { status: 401 }))

    const response = await handler(postRequest('{}', 'Bearer wrong'))

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('{"detail":{"message":"bad key"}}')
  })

  it('rechaza métodos distintos de POST', async () => {
    const response = await handler(new Request('https://x/api/jev', { method: 'GET' }))
    expect(response.status).toBe(405)
  })
})
