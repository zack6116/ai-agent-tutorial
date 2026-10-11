/**
 * 学习账号的公共逻辑：口令散列、会话令牌、Cookie、统一响应。
 *
 * 全部基于 WebCrypto，不引第三方依赖，Workers 运行时直接可用。
 */

export const SESSION_COOKIE = 'cf_session'
const SESSION_DAYS = 30
const PBKDF2_ITERATIONS = 100_000

const encoder = new TextEncoder()

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(init.headers || {})
    }
  })
}

export function fail(message, status = 400) {
  return json({ error: message }, { status })
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function derive(password, salt) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  )
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const bits = await derive(password, salt)
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(bits)}`
}

export async function verifyPassword(password, stored) {
  const [scheme, , saltHex, hashHex] = String(stored || '').split('$')
  if (scheme !== 'pbkdf2' || !saltHex || !hashHex) return false

  const salt = new Uint8Array(saltHex.match(/.{2}/g).map((byte) => parseInt(byte, 16)))
  const bits = await derive(password, salt)
  return timingSafeEqual(toHex(bits), hashHex)
}

/** 定长比较，避免通过响应时间推断口令。 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function newToken() {
  return toHex(crypto.getRandomValues(new Uint8Array(32)))
}

export async function createSession(env, userId) {
  const token = newToken()
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, userId, expiresAt)
    .run()
  return { token, expiresAt }
}

export function sessionCookie(token, maxAgeSeconds) {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${maxAgeSeconds}`
  ]
  return parts.join('; ')
}

export function clearCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}

export function readCookie(request) {
  const header = request.headers.get('Cookie') || ''
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === SESSION_COOKIE) return rest.join('=')
  }
  return null
}

/** 返回当前用户；未登录或会话过期时返回 null。 */
export async function currentUser(request, env) {
  const token = readCookie(request)
  if (!token) return null

  const row = await env.DB.prepare(
    `SELECT u.id AS id, u.email AS email, s.expires_at AS expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ?`
  )
    .bind(token)
    .first()

  if (!row) return null
  if (row.expires_at < Date.now()) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
    return null
  }
  return { id: row.id, email: row.email }
}

export async function readProgress(env, userId) {
  const { results } = await env.DB.prepare('SELECT lesson_key, done_at FROM progress WHERE user_id = ?')
    .bind(userId)
    .all()
  const progress = {}
  for (const row of results || []) progress[row.lesson_key] = row.done_at
  return progress
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const isValidEmail = (value) => typeof value === 'string' && EMAIL_RE.test(value) && value.length <= 254
export const MIN_PASSWORD = 8
