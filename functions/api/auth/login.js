import {
  json,
  fail,
  readJson,
  isValidEmail,
  verifyPassword,
  createSession,
  sessionCookie,
  readProgress
} from './_utils.js'

const SESSION_MAX_AGE = 30 * 24 * 60 * 60
const MAX_ATTEMPTS = 10
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000

/** 同一邮箱在 15 分钟内失败超过 10 次就暂时拒绝，避免在线撞库。 */
async function tooManyAttempts(env, email) {
  const row = await env.DB.prepare('SELECT count, window_start FROM login_attempts WHERE email = ?')
    .bind(email)
    .first()
  if (!row) return false
  if (Date.now() - row.window_start > ATTEMPT_WINDOW_MS) return false
  return row.count >= MAX_ATTEMPTS
}

async function recordFailure(env, email) {
  const now = Date.now()
  await env.DB.prepare(
    `INSERT INTO login_attempts (email, count, window_start) VALUES (?, 1, ?)
     ON CONFLICT(email) DO UPDATE SET
       count        = CASE WHEN ? - window_start > ? THEN 1 ELSE count + 1 END,
       window_start = CASE WHEN ? - window_start > ? THEN ? ELSE window_start END`
  )
    .bind(email, now, now, ATTEMPT_WINDOW_MS, now, ATTEMPT_WINDOW_MS, now)
    .run()
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request)
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')

  if (!isValidEmail(email) || !password) return fail('请填写邮箱和密码。')
  if (await tooManyAttempts(env, email)) return fail('尝试次数过多，请 15 分钟后再试。', 429)

  const user = await env.DB.prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
    .bind(email)
    .first()

  // 邮箱不存在时也走一次散列比对，避免通过响应时间判断账号是否存在。
  const ok = user
    ? await verifyPassword(password, user.password_hash)
    : await verifyPassword(password, 'pbkdf2$100000$00$00')

  if (!user || !ok) {
    await recordFailure(env, email)
    return fail('邮箱或密码不正确。', 401)
  }

  await env.DB.prepare('DELETE FROM login_attempts WHERE email = ?').bind(email).run()
  const { token } = await createSession(env, user.id)

  const response = json({
    user: { id: user.id, email: user.email },
    progress: await readProgress(env, user.id)
  })
  response.headers.append('Set-Cookie', sessionCookie(token, SESSION_MAX_AGE))
  return response
}
