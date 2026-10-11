/**
 * 把站点里的大资源传到 R2 桶 coderfather-assets。
 *
 * 一次性脚本，可重跑（同 key 会覆盖）。走 `wrangler r2 object put`，
 * 用的是本机 wrangler 已有的登录态 —— 脚本内外都不需要任何密钥。
 *
 *   node scripts/upload-assets-to-r2.mjs
 *
 * 传完可以用 `npx wrangler r2 object get coderfather-assets/<key> --remote --file=/tmp/x`
 * 拉回来比对。
 */

import { execFileSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const BUCKET = 'coderfather-assets'

/**
 * 要传的资源。
 *
 * key 必须落在 `public/` 前缀下 —— 线上代理（functions/api/files.js）只放行
 * 这个前缀，传错地方的表现是传上去了但页面 404。
 */
const ASSETS = [
  {
    source: 'docs/public/mapplezs-pugongying-deyueding-piano.mp3',
    key: 'public/audio/mapplezs-pugongying-deyueding-piano.mp3',
    contentType: 'audio/mpeg'
  },
  {
    source: 'docs/public/AI_Agent_全知识点双二维码宣传海报.png',
    key: 'public/images/ai-agent-poster.png',
    contentType: 'image/png'
  }
]

for (const asset of ASSETS) {
  const sourcePath = resolve(rootDir, asset.source)
  if (!existsSync(sourcePath)) {
    throw new Error(`本地文件不存在：${asset.source}`)
  }

  const sizeMb = (statSync(sourcePath).size / 1048576).toFixed(1)
  console.log(`↑ ${asset.source} （${sizeMb}MB）→ ${BUCKET}/${asset.key}`)

  execFileSync(
    'npx',
    ['wrangler', 'r2', 'object', 'put', `${BUCKET}/${asset.key}`, `--file=${sourcePath}`,
      `--content-type=${asset.contentType}`, '--remote'],
    { cwd: rootDir, stdio: 'inherit' }
  )
}

console.log('\n全部完成。代理地址（线上为 coderfather.com/ai/…）：')
for (const { key } of ASSETS) {
  console.log(`  /api/files?path=${encodeURIComponent(key)}`)
}
