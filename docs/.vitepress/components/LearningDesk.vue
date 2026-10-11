<script setup>
import { computed, onMounted } from 'vue'
import { withBase } from 'vitepress'
import { layers, stats, hours } from '../data/roadmap.js'
import { session, loadSession, isDone, toggleLesson, completionOf } from '../lib/session.js'
import AuthPanel from './AuthPanel.vue'

const lessonHref = (layer, lesson) => withBase(`/learn/${layer.id}/${lesson.number}.html`)

const overall = computed(() => {
  const total = layers.reduce((sum, l) => sum + l.lessons.length, 0)
  const done = layers.reduce((sum, l) => sum + l.lessons.filter((x) => isDone(l.id, x.number)).length, 0)
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
})

/** 第一节还没完成的课，作为「继续学习」的落点。 */
const nextUp = computed(() => {
  for (const layer of layers) {
    for (const lesson of layer.lessons) {
      if (!isDone(layer.id, lesson.number)) return { layer, lesson }
    }
  }
  return null
})

onMounted(loadSession)
</script>

<template>
  <main class="desk">
    <header class="desk-head">
      <p class="desk-eyebrow">免费学习区</p>
      <h1>你的学习台</h1>
      <p class="desk-lede">
        {{ stats.layers }} 个阶段 · {{ stats.lessons }} 节课 · 约 {{ hours(stats.minutes) }} 小时。
        进度保存在账号里，换一台电脑也能接着学。
      </p>
    </header>

    <AuthPanel />

    <section class="desk-progress" aria-label="总体进度">
      <div class="desk-ring" :style="{ '--pct': `${overall.percent}%` }" role="img" :aria-label="`已完成 ${overall.percent}%`">
        <span>{{ overall.percent }}<i>%</i></span>
      </div>
      <div class="desk-progress-copy">
        <p class="desk-progress-title">
          <template v-if="overall.done === 0">还没开始。第一节课只要 20 分钟。</template>
          <template v-else-if="overall.done === overall.total">22 节课全部完成，你已经走完了这条主线。</template>
          <template v-else>已完成 {{ overall.done }} / {{ overall.total }} 节</template>
        </p>
        <a v-if="nextUp" class="desk-continue" :href="lessonHref(nextUp.layer, nextUp.lesson)">
          <span class="desk-continue-label">{{ overall.done === 0 ? '从第一节开始' : '继续学习' }} · {{ nextUp.layer.layer }}</span>
          <span class="desk-continue-title">{{ nextUp.lesson.title }} →</span>
        </a>
        <a v-else class="desk-continue" :href="withBase('/roadmap/#rm-projects')">
          <span class="desk-continue-label">下一步</span>
          <span class="desk-continue-title">挑一个进阶项目练手 →</span>
        </a>
      </div>
    </section>

    <section v-for="layer in layers" :key="layer.id" class="desk-layer" :aria-labelledby="`desk-${layer.id}`">
      <header class="desk-layer-head">
        <div class="desk-layer-title">
          <span class="desk-layer-no">{{ layer.number }}</span>
          <div>
            <h2 :id="`desk-${layer.id}`">{{ layer.title }}</h2>
            <p>{{ layer.layer }} · {{ completionOf(layer).done }}/{{ layer.lessons.length }} 节</p>
          </div>
        </div>
        <div class="desk-layer-bar" :aria-hidden="true">
          <span :style="{ width: `${completionOf(layer).percent}%` }" />
        </div>
      </header>

      <ol class="desk-lessons">
        <li v-for="lesson in layer.lessons" :key="lesson.number" :class="{ 'is-done': isDone(layer.id, lesson.number) }">
          <button
            type="button"
            class="desk-check"
            :aria-pressed="isDone(layer.id, lesson.number)"
            :aria-label="`标记《${lesson.title}》为${isDone(layer.id, lesson.number) ? '未完成' : '已完成'}`"
            @click="toggleLesson(layer.id, lesson.number)"
          >
            <span aria-hidden="true">✓</span>
          </button>
          <a class="desk-lesson" :href="lessonHref(layer, lesson)">
            <span class="desk-lesson-no">{{ lesson.number }}</span>
            <span class="desk-lesson-body">
              <span class="desk-lesson-title">{{ lesson.title }}</span>
              <span class="desk-lesson-goal">{{ lesson.goal }}</span>
            </span>
            <span class="desk-lesson-min">{{ lesson.minutes }}′</span>
          </a>
        </li>
      </ol>
    </section>

    <p class="desk-foot">
      想先看看整条路线？<a :href="withBase('/roadmap/')">回到学习地图 →</a>
    </p>
  </main>
</template>

<style scoped>
.desk {
  width: min(880px, calc(100% - 64px));
  margin: 0 auto;
  padding: 56px 0 96px;
  color: var(--rm-ink, #1f2937);
}

.desk-eyebrow {
  color: var(--rm-brand, #4c5fd5);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.desk-head h1 {
  margin: 12px 0 0;
  font-size: clamp(30px, 3.8vw, 40px);
  font-weight: 650;
  letter-spacing: -0.03em;
}

.desk-lede {
  max-width: 560px;
  margin: 16px 0 0 0;
  color: var(--rm-muted, #596579);
  font-size: 16px;
  line-height: 1.85;
}

/* 总进度 */
.desk-progress {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-top: 32px;
  padding: 26px 28px;
  border: 1px solid var(--rm-line, #e7eaf0);
  border-radius: 14px;
  background: var(--rm-surface, #fff);
}

.desk-ring {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: conic-gradient(var(--rm-brand, #4c5fd5) var(--pct), var(--rm-line, #e7eaf0) 0);
  position: relative;
}

.desk-ring::after {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: var(--rm-surface, #fff);
}

.desk-ring > span {
  position: relative;
  z-index: 1;
  font-size: 24px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.desk-ring > span > i {
  font-size: 12px;
  font-style: normal;
  color: var(--rm-faint, #8b94a6);
}

.desk-progress-copy {
  min-width: 0;
}

.desk-progress-title {
  margin: 0;
  font-size: 16px;
  font-weight: 550;
}

.desk-continue {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 12px;
  padding: 14px 18px;
  border-radius: 10px;
  background: var(--rm-soft, #f6f7fb);
  text-decoration: none;
  transition: background-color 0.15s;
}

.desk-continue:hover {
  background: var(--rm-brand-tint, #eceffc);
}

.desk-continue-label {
  color: var(--rm-brand, #4c5fd5);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
}

.desk-continue-title {
  color: var(--rm-ink, #1f2937);
  font-size: 15px;
  font-weight: 550;
}

/* 阶段 */
.desk-layer {
  margin-top: 52px;
}

.desk-layer-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--rm-line, #e7eaf0);
}

.desk-layer-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.desk-layer-no {
  color: var(--rm-faint, #8b94a6);
  font-family: Georgia, serif;
  font-size: 28px;
  line-height: 1;
}

.desk-layer-title h2 {
  margin: 0;
  font-size: 19px;
  font-weight: 620;
  letter-spacing: -0.01em;
}

.desk-layer-title p {
  margin: 4px 0 0;
  color: var(--rm-faint, #8b94a6);
  font-size: 12px;
}

.desk-layer-bar {
  flex-shrink: 0;
  width: 140px;
  height: 4px;
  border-radius: 999px;
  background: var(--rm-line, #e7eaf0);
  overflow: hidden;
}

.desk-layer-bar > span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--rm-brand, #4c5fd5);
  transition: width 0.35s ease;
}

.desk-lessons {
  margin: 0;
  padding: 0;
  list-style: none;
}

.desk-lessons li {
  display: flex;
  align-items: stretch;
  gap: 4px;
  border-bottom: 1px solid var(--rm-line, #e7eaf0);
}

.desk-check {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  border: 0;
  background: none;
  color: transparent;
  font-size: 13px;
  cursor: pointer;
}

.desk-check > span {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--rm-line, #e7eaf0);
  border-radius: 6px;
  background: var(--rm-surface, #fff);
  transition: border-color 0.15s, background-color 0.15s;
}

.desk-check:hover > span {
  border-color: var(--rm-brand, #4c5fd5);
}

.desk-lessons li.is-done .desk-check {
  color: #fff;
}

.desk-lessons li.is-done .desk-check > span {
  border-color: var(--rm-brand, #4c5fd5);
  background: var(--rm-brand, #4c5fd5);
}

.desk-lesson {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
  padding: 16px 12px 16px 8px;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.15s;
}

.desk-lesson:hover {
  background: var(--rm-soft, #f6f7fb);
}

.desk-lesson-no {
  flex-shrink: 0;
  width: 20px;
  color: var(--rm-faint, #8b94a6);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.desk-lesson-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.desk-lesson-title {
  color: var(--rm-ink, #1f2937);
  font-size: 15px;
  font-weight: 520;
}

.desk-lessons li.is-done .desk-lesson-title {
  color: var(--rm-muted, #596579);
}

.desk-lesson-goal {
  color: var(--rm-muted, #596579);
  font-size: 13px;
  line-height: 1.6;
}

.desk-lesson-min {
  flex-shrink: 0;
  margin-left: auto;
  color: var(--rm-faint, #8b94a6);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.desk-foot {
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid var(--rm-line, #e7eaf0);
  color: var(--rm-muted, #596579);
  font-size: 14px;
}

.desk-foot a {
  color: var(--rm-brand, #4c5fd5);
  text-decoration: none;
}

.desk-foot a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 640px) {
  .desk {
    width: calc(100% - 40px);
    padding: 36px 0 64px;
  }

  .desk-progress {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 22px 20px;
  }

  .desk-layer-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .desk-layer-bar {
    width: 100%;
  }

  .desk-lesson-min {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .desk * {
    transition: none !important;
  }
}
</style>
