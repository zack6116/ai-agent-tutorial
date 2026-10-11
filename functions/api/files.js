/**
 * 大文件回源代理：GET /api/files?path=public/audio/xxx.mp3
 *
 * 站点里的音频和海报放在 R2 桶 coderfather-assets 里（不进 git，也不进 Pages 的
 * 构建产物），由这个接口代取。因为它是公开的站点资源、不是课程正文，所以不挂
 * 登录墙 —— 跟 functions/api/lessons/ 那条鉴权路径是两回事，别把两者的响应头混用。
 *
 * 走 R2 的 binding（wrangler.toml 的 [[r2_buckets]]），所以不需要任何密钥：
 * 桶的读写权限由 Pages 项目本身持有，代码里没有 key、也没有 token。
 */

/** 只放行这个前缀下的对象，免得接口变成读桶里任意文件的通道。 */
const ALLOWED_PREFIX = 'public/'

/** MIME 白名单。内容类型以这里为准，不采信桶里存的对象元数据。 */
const MIME_TYPES = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf'
}

/** 出错时的纯文本响应。绝不带 immutable —— 否则一次 404 会被边缘缓存一年。 */
function text(message, status) {
  return new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}

/**
 * 从 Range 头里取出起始偏移，用于判断区间是否越界。
 * 后缀区间（bytes=-100）和写坏的写法一律返回 null —— 那些交给 R2 自己判。
 */
function rangeStart(header) {
  const match = /^bytes=(\d+)-/.exec(header?.trim() ?? '')
  return match ? Number(match[1]) : null
}

/** 成功响应共用的头。内容不变，让浏览器和边缘缓存住，R2 只出一次网。 */
function assetHeaders(contentType, etag) {
  const headers = new Headers({
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable'
  })
  if (etag) headers.set('ETag', etag)
  return headers
}

async function handler({ request, env }) {
  const raw = new URL(request.url).searchParams.get('path')
  if (!raw) return text('缺少 path 参数。', 400)

  const key = raw.replace(/^\/+/, '')
  if (key.includes('..') || !key.startsWith(ALLOWED_PREFIX)) {
    return text('path 不合法。', 400)
  }

  const ext = key.split('.').pop()?.toLowerCase() || ''
  const contentType = MIME_TYPES[ext]
  if (!contentType) return text('不支持的文件类型。', 400)

  const bucket = env.BUCKET
  if (!bucket) {
    return text('资源存储未配置：Pages 项目缺少 R2 绑定（wrangler.toml 里应有 [[r2_buckets]] bucket_name = "coderfather-assets"）。', 503)
  }

  try {
    // HEAD 只要元信息，别把 7MB 的音频整个拖下来。
    if (request.method === 'HEAD') {
      const meta = await bucket.head(key)
      if (!meta) return text('资源不存在。', 404)
      const headers = assetHeaders(contentType, meta.httpEtag)
      headers.set('Content-Length', String(meta.size))
      return new Response(null, { status: 200, headers })
    }

    // 判断「要不要回 206」只看客户端有没有发 Range 头。
    // 不能用 object.range 判断 —— 实测（2026-10-11）R2 即使没传 range 选项，
    // 回来的对象也带着一个覆盖全量的 range（offset 0 / length = size），永远为真。
    const rangeHeader = request.headers.get('Range')
    const object = await bucket.get(key, rangeHeader ? { range: request.headers } : undefined)
    if (!object) return text('资源不存在。', 404)

    const headers = assetHeaders(contentType, object.httpEtag)

    if (!rangeHeader) {
      headers.set('Content-Length', String(object.size))
      return new Response(object.body, { status: 200, headers })
    }

    // 后缀区间（bytes=-1024）R2 已经换算成显式 offset，直接用。
    const range = object.range ?? { offset: 0, length: object.size }
    headers.set('Content-Length', String(range.length))
    headers.set('Content-Range', `bytes ${range.offset}-${range.offset + range.length - 1}/${object.size}`)
    return new Response(object.body, { status: 206, headers })
  } catch (error) {
    // R2 遇到越界区间是直接抛错，不是回个空对象 —— 实测 bytes=99999999-
    // 会走到这里。那是客户端要的区间不存在，属于 416，不是回源故障。
    const start = rangeStart(request.headers.get('Range'))
    if (start !== null) {
      const meta = await bucket.head(key).catch(() => null)
      if (meta && start >= meta.size) {
        return new Response(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${meta.size}`, 'Cache-Control': 'no-store' }
        })
      }
    }
    return text(`回源失败：${error.message}`, 502)
  }
}

export const onRequestGet = handler
export const onRequestHead = handler
