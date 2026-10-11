<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { layers, branches, projects, stats, hours } from '../data/roadmap.js'
import { session, loadSession, isDone, toggleLesson, completionOf } from '../lib/session.js'
import PersonalRoute from './PersonalRoute.vue'
import AuthPanel from './AuthPanel.vue'

const showAuth = ref(false)
const returnTo = ref(null)

/**
 * 只接受站内绝对路径。
 *
 * `from` 是闸门拼进 URL 的，属于外部输入 —— 谁都能手写一个
 * `?from=//evil.com` 丢给别人。不挡的话这里就是个开放重定向。
 * 三种写法都要拒掉：空值、协议相对（`//host`）、以及反斜杠变体（`/\host`）。
 */
function safeReturnTarget(raw) {
  if (typeof raw !== 'string' || !raw.startsWith('/')) return null
  if (raw.startsWith('//') || raw.startsWith('/\\')) return null
  return raw
}

const overall = computed(() => {
  const total = layers.reduce((sum, l) => sum + l.lessons.length, 0)
  const done = layers.reduce((sum, l) => sum + l.lessons.filter((x) => isDone(l.id, x.number)).length, 0)
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
})

const lessonHref = (layer, lesson) => withBase(`/learn/${layer.id}/${lesson.number}.html`)
const totalHours = hours(stats.minutes)

onMounted(async () => {
  await loadSession()
  // window 只在浏览器里有，所以这段必须留在 onMounted 里（构建时也会跑 setup）。
  const params = new URLSearchParams(window.location.search)
  // 被学习区闸门退回来时（/roadmap/?login=1&from=…），直接展开登录面板。
  // 已登录还弹面板只会让人困惑（收藏的旧链接会走到这里），所以加个判断。
  if (params.has('login') && !session.user) showAuth.value = true
  returnTo.value = safeReturnTarget(params.get('from'))
})

/**
 * 登录成功后把人送回原来想看的课时。
 *
 * 没有这一步的话流程是断的：点开第二节 → 被退回地图 → 登录 → 停在地图上，
 * 用户还得自己再找一遍刚才那节课。
 */
watch(
  () => session.user,
  (user) => {
    if (!user || !returnTo.value) return
    const target = returnTo.value
    returnTo.value = null // 用完即弃，避免退出后重新登录又跳一次
    window.location.replace(withBase(target))
  }
)
</script>

<template>
  <main class="roadmap" aria-labelledby="roadmap-title">
    <!-- 首屏 -->
    <section class="rm-hero">
      <p class="rm-eyebrow">coderfather.com <span aria-hidden="true">/</span> 学习地图 2026</p>
      <h1 id="roadmap-title">从零基础，<span>到做出第一个 AI 产品</span></h1>
      <p class="rm-lede">
        不是学完所有工具，而是补上你缺的那一层。
        六个阶段从「AI 能做什么」一路走到「作品真正上线」，每个阶段都有一件做完就能看见的成果。
      </p>
      <div class="rm-actions">
        <a class="rm-primary" :href="lessonHref(layers[0], layers[0].lessons[0])">
          从第一课开始 <span class="vpi-arrow-right" aria-hidden="true" />
        </a>
        <a class="rm-secondary" href="#find">30 秒找到我的起点 <span class="vpi-arrow-down" aria-hidden="true" /></a>
      </div>
      <ul class="rm-stats" aria-label="地图概览">
        <li><strong>{{ stats.layers }}</strong> 个阶段</li>
        <li><strong>{{ stats.lessons }}</strong> 节课</li>
        <li><strong>{{ totalHours }}</strong> 小时</li>
        <li><strong>{{ stats.projects }}</strong> 个实战项目</li>
      </ul>
    </section>

    <!-- 进度条 -->
    <section class="rm-progress" aria-live="polite">
      <div class="rm-progress-bar" role="progressbar" :aria-valuenow="overall.percent" aria-valuemin="0" aria-valuemax="100" aria-label="全部课程完成度">
        <span :style="{ width: `${overall.percent}%` }" />
      </div>
      <p class="rm-progress-text">
        <template v-if="session.user">
          已完成 <strong>{{ overall.done }}</strong> / {{ overall.total }} 节，进度会保存到你的账号。
        </template>
        <template v-else-if="session.status === 'loading'">正在读取学习进度…</template>
        <template v-else>
          已学 <strong>{{ overall.done }}</strong> / {{ overall.total }} 节。
          <button type="button" class="rm-inline-link" @click="showAuth = true">登录</button>
          后进度会跟着你走，换台电脑也还在。
        </template>
      </p>
    </section>

    <AuthPanel v-if="showAuth" @close="showAuth = false" />

    <!-- 主线：六个阶段 -->
    <section class="rm-section" aria-labelledby="rm-mainline">
      <header class="rm-section-head">
        <div>
          <p class="rm-eyebrow">主线 · 零基础按顺序走</p>
          <h2 id="rm-mainline">六个阶段，一条路走到底</h2>
        </div>
        <p>前一阶段的成果，就是后一阶段的起点。</p>
      </header>

      <ol class="rm-rail">
        <li v-for="layer in layers" :key="layer.id" class="rm-node" :class="{ 'is-complete': completionOf(layer).percent === 100 }">
          <div class="rm-marker" aria-hidden="true">
            <span class="rm-marker-dot">{{ layer.number }}</span>
          </div>

          <article class="rm-card" :aria-labelledby="`layer-${layer.id}`">
            <header class="rm-card-head">
              <span class="rm-layer-tag">{{ layer.layer }}</span>
              <span class="rm-card-meta">{{ completionOf(layer).done }}/{{ layer.lessons.length }} 节 · 前置：{{ layer.prerequisite }}</span>
            </header>
            <h3 :id="`layer-${layer.id}`">{{ layer.title }}</h3>
            <p class="rm-why">{{ layer.why }}</p>

            <p class="rm-outcome">
              <span class="rm-outcome-tag">学完得到</span>{{ layer.outcome }}
            </p>

            <ol class="rm-lessons">
              <li v-for="lesson in layer.lessons" :key="lesson.number">
                <button
                  type="button"
                  class="rm-check"
                  :class="{ 'is-done': isDone(layer.id, lesson.number) }"
                  :aria-pressed="isDone(layer.id, lesson.number)"
                  :aria-label="`标记《${lesson.title}》为${isDone(layer.id, lesson.number) ? '未完成' : '已完成'}`"
                  @click="toggleLesson(layer.id, lesson.number)"
                >
                  <span aria-hidden="true">✓</span>
                </button>
                <a class="rm-lesson" :href="lessonHref(layer, lesson)">
                  <span class="rm-lesson-no">{{ lesson.number }}</span>
                  <span class="rm-lesson-body">
                    <span class="rm-lesson-title">{{ lesson.title }}</span>
                    <span class="rm-lesson-goal">{{ lesson.goal }}</span>
                  </span>
                  <span class="rm-lesson-min">{{ lesson.minutes }}′</span>
                </a>
              </li>
            </ol>
          </article>
        </li>
      </ol>
    </section>

    <!-- 可选分支 -->
    <section class="rm-section" aria-labelledby="rm-branches">
      <header class="rm-section-head">
        <div>
          <p class="rm-eyebrow">可选分支</p>
          <h2 id="rm-branches">主线跑通之后，再选一条分支</h2>
        </div>
        <p>三条分支都不是必经之路，它们为具体场景服务。</p>
      </header>
      <div class="rm-branch-grid">
        <article v-for="branch in branches" :key="branch.id" class="rm-branch">
          <span class="rm-branch-no">{{ branch.number }}</span>
          <h3>{{ branch.title }}</h3>
          <p class="rm-branch-tag">{{ branch.layer }}</p>
          <p class="rm-branch-who">{{ branch.audience }}</p>
          <ol class="rm-chain">
            <li v-for="(step, i) in branch.chain" :key="step">
              <span>{{ step }}</span>
              <span v-if="i < branch.chain.length - 1" class="rm-chain-arrow" aria-hidden="true">→</span>
            </li>
          </ol>
        </article>
      </div>
    </section>

    <!-- 进阶项目 -->
    <section class="rm-section" aria-labelledby="rm-projects">
      <header class="rm-section-head">
        <div>
          <p class="rm-eyebrow">进阶地图</p>
          <h2 id="rm-projects">用项目把能力练熟</h2>
        </div>
        <p>不是「可能感兴趣」的推荐，而是按先修顺序排好的三个项目。</p>
      </header>
      <div class="rm-project-grid">
        <article v-for="(project, i) in projects" :key="project.id" class="rm-project">
          <div class="rm-project-top">
            <span class="rm-project-no">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="rm-project-level">{{ project.difficulty }}</span>
          </div>
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <ul class="rm-stack" aria-label="涉及技术">
            <li v-for="item in project.stack" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>

    <!-- 个人路线 -->
    <PersonalRoute id="find" />

    <section class="rm-cta">
      <h2>地图是免费的，课程内容登录后即可学习</h2>
      <p>学习地图不设购买墙。注册一个账号，就能开始第一课，进度会自动保存。</p>
      <div class="rm-actions">
        <a class="rm-primary" :href="lessonHref(layers[0], layers[0].lessons[0])">
          开始第一课 <span class="vpi-arrow-right" aria-hidden="true" />
        </a>
        <a class="rm-secondary" :href="withBase('/')">看看进阶书柜 <span class="vpi-arrow-right" aria-hidden="true" /></a>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* 颜色令牌统一由主题的 roadmap.css 提供（那里才写得了 .dark 覆盖），
   这里只负责版心与排版。 */
.roadmap {
  width: min(1080px, calc(100% - 64px));
  margin: 0 auto;
  padding: 0 0 96px;
  color: var(--rm-ink);
  font-size: 16px;
  line-height: 1.7;
}

.roadmap p,
.roadmap h1,
.roadmap h2,
.roadmap h3,
.roadmap ul,
.roadmap ol {
  margin: 0;
}

.roadmap ul,
.roadmap ol {
  list-style: none;
  padding: 0;
}

.roadmap a {
  text-decoration: none;
  color: inherit;
}

.roadmap a:focus-visible,
.roadmap button:focus-visible {
  outline: 3px solid var(--rm-brand);
  outline-offset: 3px;
  border-radius: 6px;
}

.roadmap [id] {
  scroll-margin-top: 96px;
}

/* 首屏 */
.rm-hero {
  position: relative;
  padding: 84px 0 56px;
}

.rm-hero::before {
  content: '';
  position: absolute;
  inset: -60px -200px auto;
  height: 320px;
  background-image: radial-gradient(circle, rgba(76, 95, 213, 0.16) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: radial-gradient(ellipse 60% 100% at 20% 0%, #000 0%, transparent 70%);
  pointer-events: none;
}

.rm-eyebrow {
  position: relative;
  color: var(--rm-brand);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.rm-eyebrow > span {
  margin: 0 10px;
  color: var(--rm-faint);
  font-weight: 400;
}

.rm-hero h1 {
  position: relative;
  margin-top: 22px;
  font-size: clamp(36px, 4.4vw, 54px);
  font-weight: 650;
  line-height: 1.24;
  letter-spacing: -0.04em;
}

.rm-hero h1 > span {
  display: block;
}

.rm-lede {
  position: relative;
  max-width: 620px;
  margin-top: 24px;
  color: var(--rm-muted);
  font-size: 17px;
  line-height: 1.85;
}

.rm-actions {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 28px;
  margin-top: 32px;
}

.rm-primary,
.rm-secondary {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  min-height: 48px;
  font-size: 15px;
  font-weight: 550;
}

.rm-primary {
  padding: 0 24px;
  border-radius: 8px;
  color: #fff;
  background: var(--rm-brand);
  transition: background-color 0.15s;
}

.rm-primary:hover {
  background: var(--rm-brand-strong);
}

.rm-secondary {
  color: var(--rm-muted);
  transition: color 0.15s;
}

.rm-secondary:hover {
  color: var(--rm-brand);
}

.rm-stats {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 0;
  margin-top: 34px;
  color: var(--rm-muted);
  font-size: 13px;
}

.rm-stats li + li {
  border-left: 1px solid var(--rm-line);
  margin-left: 16px;
  padding-left: 16px;
}

.rm-stats strong {
  color: var(--rm-ink);
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* 进度 */
.rm-progress {
  padding: 20px 24px;
  border: 1px solid var(--rm-line);
  border-radius: 12px;
  background: var(--rm-surface);
}

.rm-progress-bar {
  height: 4px;
  border-radius: 999px;
  background: var(--rm-line);
  overflow: hidden;
}

.rm-progress-bar > span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--rm-brand);
  transition: width 0.4s ease;
}

.rm-progress-text {
  margin-top: 12px;
  color: var(--rm-muted);
  font-size: 13px;
}

.rm-progress-text strong {
  color: var(--rm-ink);
  font-variant-numeric: tabular-nums;
}

.rm-inline-link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--rm-brand);
  font: inherit;
  font-weight: 550;
  cursor: pointer;
}

.rm-inline-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* 通用区块头 */
.rm-section {
  padding-top: 76px;
}

.rm-section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--rm-line);
}

.rm-section-head h2 {
  margin-top: 10px;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.02em;
}

.rm-section-head > p {
  flex-shrink: 0;
  max-width: 300px;
  padding-bottom: 4px;
  color: var(--rm-muted);
  font-size: 14px;
  text-align: right;
}

/* 主线轨道 */
.rm-rail {
  margin-top: 44px;
}

.rm-node {
  position: relative;
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 20px;
  padding-bottom: 36px;
}

/* 连接线 */
.rm-node::before {
  content: '';
  position: absolute;
  top: 46px;
  bottom: -2px;
  left: 31px;
  width: 2px;
  background: var(--rm-line);
}

.rm-node:last-child::before {
  display: none;
}

.rm-marker {
  position: relative;
  padding-top: 4px;
}

.rm-marker-dot {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 2px solid var(--rm-line);
  border-radius: 50%;
  background: var(--rm-page);
  color: var(--rm-muted);
  font-size: 13px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  transition: border-color 0.2s, background-color 0.2s, color 0.2s;
}

.rm-node.is-complete .rm-marker-dot {
  border-color: var(--rm-brand);
  background: var(--rm-brand);
  color: #fff;
}

.rm-card {
  padding: 26px 28px 22px;
  border: 1px solid var(--rm-line);
  border-radius: 14px;
  background: var(--rm-surface);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.rm-card:hover {
  border-color: #d5dae6;
  box-shadow: 0 8px 26px rgba(31, 41, 55, 0.06);
}

.rm-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.rm-layer-tag {
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--rm-brand-tint, #eceffc);
  color: var(--rm-brand);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.rm-card-meta {
  color: var(--rm-faint);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.rm-card h3 {
  margin-top: 16px;
  font-size: 22px;
  font-weight: 620;
  line-height: 1.45;
  letter-spacing: -0.02em;
}

.rm-why {
  margin-top: 10px;
  color: var(--rm-muted);
  font-size: 15px;
}

.rm-outcome {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-top: 18px;
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--rm-soft);
  font-size: 14px;
  line-height: 1.7;
}

.rm-outcome-tag {
  flex-shrink: 0;
  color: var(--rm-brand);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
}

.rm-lessons {
  margin-top: 18px;
}

.rm-lessons li {
  display: flex;
  align-items: stretch;
  gap: 4px;
  border-top: 1px solid var(--rm-line);
}

.rm-check {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 34px;
  border: 0;
  background: none;
  color: transparent;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.15s;
}

.rm-check > span {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--rm-line);
  border-radius: 6px;
  background: var(--rm-surface);
  transition: border-color 0.15s, background-color 0.15s, color 0.15s;
}

.rm-check:hover > span {
  border-color: var(--rm-brand);
}

.rm-check.is-done {
  color: #fff;
}

.rm-check.is-done > span {
  border-color: var(--rm-brand);
  background: var(--rm-brand);
}

.rm-lesson {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
  padding: 14px 12px 14px 8px;
  border-radius: 8px;
  transition: background-color 0.15s;
}

.rm-lesson:hover {
  background: var(--rm-soft);
}

.rm-lesson-no {
  flex-shrink: 0;
  width: 20px;
  color: var(--rm-faint);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.rm-lesson-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.rm-lesson-title {
  font-size: 15px;
  font-weight: 520;
}

.rm-lesson-goal {
  color: var(--rm-muted);
  font-size: 13px;
  line-height: 1.6;
}

.rm-lesson-min {
  flex-shrink: 0;
  margin-left: auto;
  color: var(--rm-faint);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

/* 分支 */
.rm-branch-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.rm-branch {
  padding: 26px 24px;
  border: 1px solid var(--rm-line);
  border-radius: 14px;
  background: var(--rm-surface);
}

.rm-branch-no {
  color: var(--rm-brand);
  font-family: Georgia, serif;
  font-size: 26px;
  line-height: 1;
}

.rm-branch h3 {
  margin-top: 14px;
  font-size: 19px;
  font-weight: 620;
}

.rm-branch-tag {
  margin-top: 4px;
  color: var(--rm-faint);
  font-size: 12px;
  letter-spacing: 0.05em;
}

.rm-branch-who {
  margin-top: 14px;
  color: var(--rm-muted);
  font-size: 14px;
  line-height: 1.75;
}

.rm-chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--rm-line);
}

.rm-chain li {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--rm-ink);
  font-size: 12px;
}

.rm-chain-arrow {
  color: var(--rm-brand);
}

/* 项目 */
.rm-project-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.rm-project {
  display: flex;
  flex-direction: column;
  padding: 26px 24px;
  border: 1px solid var(--rm-line);
  border-radius: 14px;
  background: var(--rm-surface);
}

.rm-project-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rm-project-no {
  color: var(--rm-faint);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.rm-project-level {
  padding: 3px 9px;
  border: 1px solid var(--rm-line);
  border-radius: 999px;
  color: var(--rm-muted);
  font-size: 11px;
}

.rm-project h3 {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 620;
  line-height: 1.5;
}

.rm-project > p {
  margin-top: 10px;
  color: var(--rm-muted);
  font-size: 14px;
  line-height: 1.75;
}

.rm-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
  padding-top: 18px;
}

.rm-stack li {
  padding: 3px 9px;
  border-radius: 6px;
  background: var(--rm-soft);
  color: var(--rm-muted);
  font-size: 11px;
}

/* 底部行动区 */
.rm-cta {
  margin-top: 80px;
  padding: 48px 40px;
  border: 1px solid var(--rm-line);
  border-radius: 16px;
  background: var(--rm-surface);
  text-align: center;
}

.rm-cta h2 {
  font-size: 26px;
  font-weight: 620;
  letter-spacing: -0.02em;
}

.rm-cta > p {
  max-width: 540px;
  margin: 14px auto 0;
  color: var(--rm-muted);
  font-size: 15px;
  line-height: 1.8;
}

.rm-cta .rm-actions {
  justify-content: center;
}

/* 深色模式的令牌与局部覆盖见主题 roadmap.css 的 .dark 段。 */

/* 响应式 */
@media (max-width: 960px) {
  .rm-branch-grid,
  .rm-project-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .rm-project-grid > :last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .roadmap {
    width: calc(100% - 40px);
    padding-bottom: 64px;
  }

  .rm-hero {
    padding: 52px 0 40px;
  }

  .rm-hero h1 {
    font-size: clamp(28px, 8.4vw, 38px);
  }

  .rm-lede {
    font-size: 16px;
  }

  .rm-section {
    padding-top: 56px;
  }

  .rm-section-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .rm-section-head h2 {
    font-size: 24px;
  }

  .rm-section-head > p {
    max-width: none;
    text-align: left;
  }

  .rm-node {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .rm-node::before {
    display: none;
  }

  .rm-marker-dot {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .rm-card {
    padding: 22px 18px 18px;
  }

  .rm-card-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .rm-card h3 {
    font-size: 20px;
  }

  .rm-outcome {
    flex-direction: column;
    gap: 6px;
  }

  .rm-lesson {
    gap: 12px;
    padding: 13px 8px;
  }

  .rm-branch-grid,
  .rm-project-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .rm-project-grid > :last-child {
    grid-column: auto;
  }

  .rm-cta {
    padding: 32px 22px;
  }

  .rm-cta h2 {
    font-size: 21px;
  }
}

@media (max-width: 460px) {
  .rm-stats li + li {
    margin-left: 12px;
    padding-left: 12px;
  }

  .rm-lesson-min {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .roadmap * {
    transition: none !important;
  }
}
</style>
