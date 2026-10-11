<script setup>
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { layers } from '../data/roadmap.js'
import { loadSession, isDone, toggleLesson, session, apiUrl } from '../lib/session.js'
import AuthPanel from './AuthPanel.vue'

const props = defineProps({
  layer: { type: String, required: true },
  lesson: { type: String, required: true }
})

const showAuth = ref(false)

/** 课号、标题、目标、时长是公开的学习地图，先渲染出来，不等人。 */
const meta = computed(() => layers.find((l) => l.id === props.layer) || null)
const outline = computed(() => meta.value?.lessons.find((x) => x.number === props.lesson) || null)

/**
 * 正文不在客户端包里。
 *
 * 它是登录后从 /api/lessons/ 取回来的 —— 打包进 JS 分块等于把 22 节课
 * 免费送给所有未登录的人（实测确实如此），所以正文只能走鉴权接口。
 * 地图数据留在这里兜底标题，接口拿到正文后合进来。
 */
const body = ref(null)
const state = ref('loading') // loading | ready | locked | unconfigured | failed

const lesson = computed(() => (outline.value ? { ...(body.value || {}), ...outline.value } : null))

async function loadBody() {
  state.value = 'loading'
  try {
    // 走 apiUrl：站点挂在 coderfather.com/ai/ 这类子路径下时，接口前缀要跟着
    // site.base 走，不能写死 /api/（那样会打到 apex 根路径 404）。
    const response = await fetch(apiUrl(`/lessons/${props.layer}/${props.lesson}.html`), {
      credentials: 'same-origin'
    })
    if (response.status === 401) {
      state.value = 'locked'
      return
    }
    if (response.status === 503) {
      state.value = 'unconfigured'
      return
    }
    if (!response.ok) {
      state.value = 'failed'
      return
    }
    body.value = (await response.json()).content
    state.value = 'ready'
  } catch {
    state.value = 'failed'
  }
}

/** 登录面板关掉后重取一次：登录成功要放行，退出登录要重新关上。 */
function afterAuth() {
  showAuth.value = false
  loadBody()
}

/**
 * 勾选「本节完成」。
 *
 * 不要在模板里直接写 toggleLesson(layer, lesson)：这里的 `lesson` 是上面那个
 * 计算属性（一个对象），不是 props.lesson（课号）。两者同名时模板里计算属性赢，
 * 于是写进后端的 key 会变成 `mindset/[object Object]` —— 按钮永远点不亮，
 * 进度表里还悄悄多一条垃圾。上线后实测踩到过，所以这里显式用 props。
 */
function toggleDone() {
  toggleLesson(props.layer, props.lesson)
}

/** 上一节 / 下一节：在当前阶段内前后移动，跨阶段时接到相邻阶段的头尾。 */
const flat = computed(() =>
  layers.flatMap((l) => l.lessons.map((x) => ({ layerId: l.id, number: x.number, title: x.title, layerTitle: l.title })))
)

const index = computed(() => flat.value.findIndex((x) => x.layerId === props.layer && x.number === props.lesson))
const prev = computed(() => (index.value > 0 ? flat.value[index.value - 1] : null))
const next = computed(() => (index.value >= 0 && index.value < flat.value.length - 1 ? flat.value[index.value + 1] : null))

const href = (item) => withBase(`/learn/${item.layerId}/${item.number}.html`)

const done = computed(() => isDone(props.layer, props.lesson))

/**
 * 课时正文里的行内标记：`**粗体**`、`` `代码` ``、`[文字](链接)`。
 * 内容是随站点一起打包的静态文案，不含用户输入，因此可以安全地转成 HTML。
 */
function renderInline(text) {
  if (text === null || text === undefined) return ''
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(
      /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
}

onMounted(() => {
  loadSession()
  loadBody()
})
</script>

<template>
  <main class="lesson">
    <nav class="ls-crumb" aria-label="面包屑导航">
      <a :href="withBase('/roadmap/')">学习地图</a>
      <span aria-hidden="true">/</span>
      <span>{{ meta?.layer }}</span>
    </nav>

    <template v-if="lesson">
      <header class="ls-head">
        <p class="ls-eyebrow">{{ meta?.number }} · {{ meta?.layer }} · 约 {{ lesson.minutes }} 分钟</p>
        <h1>{{ lesson.title }}</h1>
        <p class="ls-goal"><span>本节目标</span>{{ lesson.goal }}</p>
      </header>

      <template v-if="state === 'ready'">
        <p class="ls-intro" v-html="renderInline(lesson.intro)" />

        <section v-for="(section, i) in lesson.sections" :key="i" class="ls-section">
          <h2>{{ section.heading }}</h2>
          <p v-for="(para, pi) in section.paras" :key="pi" v-html="renderInline(para)" />
          <ul v-if="section.list">
            <li v-for="(item, li) in section.list" :key="li" v-html="renderInline(item)" />
          </ul>
        </section>

        <section class="ls-exercise">
          <h2><span aria-hidden="true">✎</span> {{ lesson.exercise.title }}</h2>
          <ol>
            <li v-for="(step, si) in lesson.exercise.steps" :key="si" v-html="renderInline(step)" />
          </ol>
        </section>

        <section class="ls-check">
          <h2>完成标准</h2>
          <ul>
            <li v-for="(item, ci) in lesson.checklist" :key="ci">
              <span class="ls-check-mark" aria-hidden="true">✓</span><span v-html="renderInline(item)" />
            </li>
          </ul>
        </section>
      </template>

      <p v-else-if="state === 'loading'" class="ls-body-state">正在读取正文…</p>

      <p v-else-if="state === 'locked'" class="ls-body-state">
        这一节需要登录后才能阅读。
        <button type="button" class="ls-link" @click="showAuth = true">登录 / 注册</button>
      </p>

      <p v-else-if="state === 'unconfigured'" class="ls-body-state">
        学习区还没完成配置：服务端缺少数据库绑定，正文暂时取不到。站点维护者需要绑定 D1 后重新部署。
      </p>

      <p v-else class="ls-body-state">
        正文没能加载出来，可能是网络问题。
        <button type="button" class="ls-link" @click="loadBody">重试</button>
      </p>

      <div v-if="state === 'ready'" class="ls-mark">
        <button type="button" class="ls-mark-btn" :class="{ 'is-done': done }" :aria-pressed="done" @click="toggleDone">
          <span aria-hidden="true">{{ done ? '✓' : '○' }}</span>
          {{ done ? '已标记完成' : '标记本节为完成' }}
        </button>
        <p v-if="!session.user" class="ls-mark-hint">
          <button type="button" class="ls-link" @click="showAuth = true">登录</button>
          后进度会保存到账号，换设备也能接着学。
        </p>
      </div>

      <AuthPanel v-if="showAuth" @close="afterAuth" />

      <nav class="ls-nav" aria-label="课时导航">
        <a v-if="prev" class="ls-nav-item" :href="href(prev)">
          <span class="ls-nav-label">上一节 · {{ prev.layerTitle }}</span>
          <span class="ls-nav-title">← {{ prev.title }}</span>
        </a>
        <span v-else class="ls-nav-item is-empty" />
        <a v-if="next" class="ls-nav-item is-next" :href="href(next)">
          <span class="ls-nav-label">下一节 · {{ next.layerTitle }}</span>
          <span class="ls-nav-title">{{ next.title }} →</span>
        </a>
      </nav>
    </template>

    <p v-else class="ls-missing">
      这一节的内容还在路上。<a :href="withBase('/roadmap/')">回到学习地图 →</a>
    </p>
  </main>
</template>

<style scoped>
.lesson {
  width: min(760px, calc(100% - 64px));
  margin: 0 auto;
  padding: 56px 0 96px;
  color: var(--rm-ink, #1f2937);
}

.ls-crumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 26px;
  color: var(--rm-faint, #8b94a6);
  font-size: 12px;
}

.ls-crumb a {
  color: var(--rm-muted, #596579);
  text-decoration: none;
}

.ls-crumb a:hover {
  color: var(--rm-brand, #4c5fd5);
}

.ls-eyebrow {
  color: var(--rm-brand, #4c5fd5);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.09em;
}

.ls-head h1 {
  margin: 12px 0 0;
  font-size: clamp(28px, 3.6vw, 38px);
  font-weight: 650;
  line-height: 1.3;
  letter-spacing: -0.03em;
}

.ls-goal {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 22px 0 0;
  padding: 16px 20px;
  border-radius: 10px;
  background: var(--rm-soft, #f6f7fb);
  font-size: 15px;
  line-height: 1.75;
}

.ls-goal > span {
  color: var(--rm-brand, #4c5fd5);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.08em;
}

.ls-intro {
  margin: 26px 0 0;
  color: var(--rm-muted, #596579);
  font-size: 17px;
  line-height: 1.9;
}

/* 正文未就绪时的占位：加载中 / 未登录 / 配置缺失 / 失败，共用一块样式。 */
.ls-body-state {
  margin: 40px 0 0;
  padding: 26px 28px;
  border: 1px solid var(--rm-line, #e7eaf0);
  border-radius: 12px;
  background: var(--rm-soft, #f6f7fb);
  color: var(--rm-muted, #596579);
  font-size: 15px;
  line-height: 1.85;
}

.ls-section {
  margin-top: 44px;
}

.ls-section h2 {
  margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--rm-line, #e7eaf0);
  font-size: 21px;
  font-weight: 620;
  letter-spacing: -0.01em;
}

.ls-section p {
  margin: 14px 0;
  font-size: 16px;
  line-height: 1.95;
}

.ls-section ul {
  margin: 16px 0;
  padding-left: 0;
  list-style: none;
}

.ls-section li {
  position: relative;
  margin-top: 10px;
  padding-left: 20px;
  font-size: 15.5px;
  line-height: 1.9;
}

.ls-section li::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 4px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--rm-brand, #4c5fd5);
}

.ls-section :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--rm-soft, #f6f7fb);
  color: var(--rm-code, #3b4bb0);
  font-size: 0.88em;
}

.ls-section :deep(a) {
  color: var(--rm-brand, #4c5fd5);
  text-underline-offset: 3px;
}

.ls-exercise {
  margin-top: 44px;
  padding: 26px 28px;
  border-radius: 12px;
  background: var(--rm-soft, #f6f7fb);
}

.ls-exercise h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  font-size: 18px;
  font-weight: 620;
}

.ls-exercise h2 > span {
  color: var(--rm-brand, #4c5fd5);
}

.ls-exercise ol {
  margin: 0;
  padding-left: 22px;
}

.ls-exercise li {
  margin-top: 10px;
  font-size: 15px;
  line-height: 1.85;
}

.ls-exercise li::marker {
  color: var(--rm-brand, #4c5fd5);
  font-weight: 600;
}

.ls-check {
  margin-top: 36px;
  padding-top: 26px;
  border-top: 1px solid var(--rm-line, #e7eaf0);
}

.ls-check h2 {
  margin: 0 0 14px;
  font-size: 18px;
  font-weight: 620;
}

.ls-check ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ls-check li {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  font-size: 15px;
  line-height: 1.8;
}

.ls-check-mark {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-top: 3px;
  border-radius: 6px;
  background: var(--rm-brand-soft, #e9ecfb);
  color: var(--rm-brand, #4c5fd5);
  font-size: 11px;
  font-weight: 700;
}

.ls-mark {
  margin-top: 40px;
}

.ls-mark-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 22px;
  border: 1px solid var(--rm-line, #e7eaf0);
  border-radius: 8px;
  background: var(--rm-surface, #fff);
  color: var(--rm-ink, #1f2937);
  font: inherit;
  font-size: 15px;
  font-weight: 550;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s, color 0.15s;
}

.ls-mark-btn:hover {
  border-color: var(--rm-brand, #4c5fd5);
  color: var(--rm-brand, #4c5fd5);
}

.ls-mark-btn.is-done {
  border-color: var(--rm-brand, #4c5fd5);
  background: var(--rm-brand, #4c5fd5);
  color: #fff;
}

.ls-mark-hint {
  margin: 12px 0 0;
  color: var(--rm-faint, #8b94a6);
  font-size: 13px;
}

.ls-link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--rm-brand, #4c5fd5);
  font: inherit;
  font-weight: 550;
  cursor: pointer;
}

.ls-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.ls-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 56px;
  padding-top: 28px;
  border-top: 1px solid var(--rm-line, #e7eaf0);
}

.ls-nav-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  border: 1px solid var(--rm-line, #e7eaf0);
  border-radius: 10px;
  background: var(--rm-surface, #fff);
  text-decoration: none;
  transition: border-color 0.15s;
}

.ls-nav-item:not(.is-empty):hover {
  border-color: var(--rm-brand, #4c5fd5);
}

.ls-nav-item.is-empty {
  border: 0;
  background: none;
}

.ls-nav-item.is-next {
  text-align: right;
}

.ls-nav-label {
  color: var(--rm-faint, #8b94a6);
  font-size: 11px;
}

.ls-nav-title {
  color: var(--rm-ink, #1f2937);
  font-size: 15px;
  font-weight: 550;
  line-height: 1.5;
}

.ls-missing {
  color: var(--rm-muted, #596579);
}

.ls-missing a {
  color: var(--rm-brand, #4c5fd5);
}

@media (max-width: 640px) {
  .lesson {
    width: calc(100% - 40px);
    padding: 36px 0 64px;
  }

  .ls-exercise {
    padding: 22px 18px;
  }

  .ls-nav {
    grid-template-columns: 1fr;
  }

  .ls-nav-item.is-next {
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lesson * {
    transition: none !important;
  }
}
</style>
