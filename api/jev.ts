const TYPESAFE_URL = 'https://api.typesafe.ai/v1/systemone'

export const config = { runtime: 'edge' }

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405, { Allow: 'POST' })
  }

  const authorization =
    request.headers.get('authorization') ||
    (process.env.TYPESAFE_API_KEY ? `Bearer ${process.env.TYPESAFE_API_KEY}` : '')

  try {
    const upstream = await fetch(TYPESAFE_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(authorization ? { authorization } : {}),
      },
      body: await request.text(),
    })

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    })
  } catch {
    return json({ error: 'No se pudo contactar a TypeSafe' }, 502)
  }
}

function json(body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  })
}
