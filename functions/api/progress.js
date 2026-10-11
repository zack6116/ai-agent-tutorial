import { json, fail, readJson, currentUser } from './auth/_utils.js'

/** 只接受 `<阶段 id>/<两位课时号>` 形式的键，避免写入任意内容。 */
function isValidKey(key) {
  return typeof key === 'string' && /^[a-z]{3,20}\/\d{2}$/.test(key)
}

export async function onRequestPost({ request, env }) {
  const user = await currentUser(request, env)
  if (!user) return fail('请先登录。', 401)

  const body = await readJson(request)
  const key = body?.key
  if (!isValidKey(key)) return fail('无效的课时标识。')

  if (body.done) {
    await env.DB.prepare(
      `INSERT INTO progress (user_id, lesson_key, done_at) VALUES (?, ?, ?)
       ON CONFLICT(user_id, lesson_key) DO UPDATE SET done_at = excluded.done_at`
    )
      .bind(user.id, key, Date.now())
      .run()
  } else {
    await env.DB.prepare('DELETE FROM progress WHERE user_id = ? AND lesson_key = ?')
      .bind(user.id, key)
      .run()
  }

  return json({ ok: true, key, done: Boolean(body.done) })
}
