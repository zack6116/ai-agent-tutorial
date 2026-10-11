import { currentUser } from '../api/auth/_utils.js'

/**
 * 免费学习区的入口闸门：没有有效会话就退回学习地图。
 *
 * 这里是「页面路由」这一层的关。正文本身另有关：正文不在客户端包里，
 * 由 /api/lessons/<层>/<课> 鉴权后按需下发（见 functions/api/lessons/）。
 * 两道关都必要 —— 只挡页面的话，VitePress 打出来的静态页和 JS 分块照样能被下载。
 *
 * 关于放行：
 *   以前没绑 D1 时这里 `return next()` 直接放行，理由是「本地预览要能看」。
 *   那个理由站不住：线上万一漏配一次绑定，整堵墙就没了，而且没人会收到告警。
 *   现在改成 fail closed —— 缺配置就 503 并说清楚缺什么。
 *   确实需要纯静态预览（不起 Functions）时，显式设 LEARN_OPEN=1 放行。
 */
export async function onRequest(context) {
  const { request, env, next } = context

  // 逃生舱只认显式开关，且必须在构建/部署时手动设置，不会自己变成 true。
  if (env.LEARN_OPEN === '1') return next()

  if (!env.DB) return notConfigured()

  const user = await currentUser(request, env)
  if (user) return next()

  const target = new URL('/roadmap/', request.url)
  target.searchParams.set('login', '1')
  target.searchParams.set('from', new URL(request.url).pathname)
  return Response.redirect(target.toString(), 302)
}

function notConfigured() {
  return new Response(
    '学习区尚未完成配置：服务端缺少 D1 数据库绑定（env.DB）。\n' +
      '请在 Cloudflare Pages 项目的 Settings → Functions → D1 bindings 里绑定名为 DB 的数据库，' +
      '或把 wrangler.toml 里的 database_id 换成真实值后重新部署。\n' +
      '（本地纯静态预览可显式设置 LEARN_OPEN=1 临时放行。）\n',
    { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } }
  )
}
