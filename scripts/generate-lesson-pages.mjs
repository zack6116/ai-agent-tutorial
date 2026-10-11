/**
 * 根据 docs/.vitepress/data/roadmap.js 生成 docs/learn/<layer>/<nn>.md 课时页。
 *
 * 课时正文放在 data/lessons/ 里，页面文件只是薄薄一层壳。
 * 数据变了重跑一次即可：node scripts/generate-lesson-pages.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { layers } = await import(join(root, 'docs/.vitepress/data/roadmap.js'))
const { getLesson } = await import(join(root, 'docs/.vitepress/data/lessons/index.js'))

const LAYOUT = `---
layout: page
title: {TITLE}
description: {DESC}
---

<script setup>
import LessonView from '../../.vitepress/components/LessonView.vue'
<\/script>

<LessonView layer="{LAYER}" lesson="{LESSON}" />
`

let written = 0
const missing = []

for (const layer of layers) {
  for (const lesson of layer.lessons) {
    const content = getLesson(layer.id, lesson.number)
    if (!content) {
      missing.push(`${layer.id}/${lesson.number}`)
      continue
    }

    const file = join(root, 'docs/learn', layer.id, `${lesson.number}.md`)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(
      file,
      LAYOUT.replace('{TITLE}', lesson.title)
        .replace('{DESC}', lesson.goal)
        .replace('{LAYER}', layer.id)
        .replace('{LESSON}', lesson.number),
      'utf8'
    )
    written++
  }
}

console.log(`生成 ${written} 个课时页`)
if (missing.length) console.warn(`缺少正文：${missing.join(', ')}`)
