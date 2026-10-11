/**
 * 把课时正文从 VitePress 客户端包里挪出来，导出成 Functions 能读的 JSON。
 *
 * 背景：LessonView.vue 原本静态 import 正文，VitePress 会把这 22 节课的全文
 * 打进 /assets/chunks/LessonView.*.js —— 未登录的人直接下载那个 chunk 就拿到
 * 了全部内容，登录墙形同虚设（已在本地实测确认）。
 *
 * 现在正文只落在这个 JSON 里，由 /api/lessons/<层>/<课> 鉴权后按需下发，
 * 客户端包（docs/.vitepress/dist/assets/**）里一个字都不剩。
 *
 * 用法：node scripts/build-lesson-data.mjs
 * 构建前必须先跑，否则接口读到的还是上一版正文。
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const { default: byLayer } = await import(join(root, 'docs/.vitepress/data/lessons/index.js'))

/**
 * 只导出正文四件套。
 * 标题、目标、时长、课号属于公开的学习地图，留在 roadmap.js 里由前端直接渲染 ——
 * 那是「地图免费看」的一部分，不该也不需要在登录墙后面。
 */
const BODY_KEYS = ['intro', 'sections', 'exercise', 'checklist']

const payload = {}
let lessonCount = 0
let bytes = 0

for (const [layerId, lessonsOfLayer] of Object.entries(byLayer)) {
  payload[layerId] = {}
  for (const [number, content] of Object.entries(lessonsOfLayer)) {
    const body = {}
    for (const key of BODY_KEYS) {
      if (content[key] === undefined) continue
      body[key] = content[key]
    }
    // 少任何一件都说明正文结构变了，宁可构建失败也不发一节残缺的课。
    const missing = BODY_KEYS.filter((key) => body[key] === undefined)
    if (missing.length) {
      throw new Error(`${layerId}/${number} 缺少正文字段：${missing.join(', ')}`)
    }
    payload[layerId][number] = body
    lessonCount++
    bytes += JSON.stringify(body).length
  }
}

const out = join(root, 'functions/_data/lessons.json')
await mkdir(dirname(out), { recursive: true })
await writeFile(out, JSON.stringify(payload), 'utf8')

console.log(`已生成 ${out}`)
console.log(`课时 ${lessonCount} 节，正文合计 ${bytes.toLocaleString('en-US')} 字节`)
