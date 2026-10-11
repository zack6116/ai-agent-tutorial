import { json, currentUser, readProgress } from './_utils.js'

export async function onRequestGet({ request, env }) {
  const user = await currentUser(request, env)
  if (!user) return json({ user: null, progress: {} })
  return json({ user, progress: await readProgress(env, user.id) })
}
