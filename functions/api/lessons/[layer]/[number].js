import { currentUser } from '../../auth/_utils.js'
import CONTENT from '../../../_data/lessons.json'

/**
 * 课时正文接口 —— 免费学习区的正文只从这里出，客户端包里没有。
 *
 * 三道关，缺一不可：
 *
 * 1) env.DB 没绑定 → 503。缺配置不等于无保护：以前这里（以及 /learn/ 的闸门）
 *    在没绑库时直接放行，等于部署漏配一次就把墙拆了。现在一律关死。
 *
 * 2) 没有有效会话 → 401。
 *
 * 3) no-store + Vary: Cookie。少了这个，CDN 会把某个已登录用户的响应缓存下来
 *    发给所有人 —— 墙还在，但门是开的。
 */
export async function onRequestGet({ request, env, params }) {
  if (!env.DB) {
    return json({ error: 'server_not_configured', message: '学习区尚未完成配置（服务端缺少数据库绑定）。' }, 503)
  }

  const user = await currentUser(request, env)
  if (!user) {
    return json({ error: 'unauthorized', message: '请先登录再继续学习。' }, 401)
  }

  const layer = String(params.layer || '')
  const number = String(params.number || '').replace(/\.html$/, '')
  const content = CONTENT[layer]?.[number]

  if (!content) {
    return json({ error: 'not_found' }, 404)
  }

  return json({ layer, number, content }, 200)
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // 认证响应绝不进缓存，否则会把正文泄漏给下一个访客。
      'Cache-Control': 'no-store, private',
      Vary: 'Cookie'
    }
  })
}
