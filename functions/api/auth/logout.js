import { json, readCookie, clearCookie } from './_utils.js'

export async function onRequestPost({ request, env }) {
  const token = readCookie(request)
  if (token) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
  }
  const response = json({ ok: true })
  response.headers.append('Set-Cookie', clearCookie())
  return response
}
