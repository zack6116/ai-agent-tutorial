import {
  json,
  fail,
  readJson,
  isValidEmail,
  MIN_PASSWORD,
  hashPassword,
  createSession,
  sessionCookie
} from './_utils.js'

const SESSION_MAX_AGE = 30 * 24 * 60 * 60

export async function onRequestPost({ request, env }) {
  const body = await readJson(request)
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')

  if (!isValidEmail(email)) return fail('请填写有效的邮箱地址。')
  if (password.length < MIN_PASSWORD) return fail(`密码至少需要 ${MIN_PASSWORD} 位。`)
  if (password.length > 200) return fail('密码过长。')

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) return fail('这个邮箱已经注册过了，直接登录即可。', 409)

  const now = Date.now()
  const result = await env.DB.prepare(
    'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)'
  )
    .bind(email, await hashPassword(password), now)
    .run()

  const userId = result.meta.last_row_id
  const { token } = await createSession(env, userId)

  const response = json({ user: { id: userId, email }, progress: {} })
  response.headers.append('Set-Cookie', sessionCookie(token, SESSION_MAX_AGE))
  return response
}
