import { computed, reactive, readonly } from 'vue'

/**
 * 学习账号与进度。
 *
 * 后端是 Cloudflare Pages Functions（functions/api/**），用 D1 存账号与进度。
 * 静态预览或本地 `vitepress dev` 里没有 Functions，接口会 404 —— 这时退回
 * 「本地模式」：登录不可用，进度只存在当前浏览器，页面依然完整可读。
 */

const PROGRESS_KEY = 'coderfather-roadmap-progress-v1'

/**
 * 接口前缀。
 *
 * 同一份产物同时挂在两个地址上：
 *   · 根路径 —— https://ai-agent-tutorial-e9s.pages.dev/
 *   · 子路径 —— https://coderfather.com/ai/（由 coderfather-router 代理）
 * 代理会把 VitePress 的 site.base 从 '/' 改写成 '/ai/'，客户端的路由也跟着改，
 * 所以接口前缀必须同样以 site.base 为准。写死 '/api' 的话，子路径下的登录、
 * 注册、进度请求全都会打到 apex 根路径上去 404 —— 2026-10-11 线上实测踩到过。
 */
let apiBase = ''

/** 由 GuideLayout 在站点 base 可读时注入（根路径传 ''，子路径传 '/ai'）。 */
export function configureApiBase(base) {
  apiBase = typeof base === 'string' ? base.replace(/\/+$/, '') : ''
}

/** 拼出接口地址：根路径下是 /api/…，子路径下是 /ai/api/…。 */
export function apiUrl(path) {
  return `${apiBase}/api/${String(path).replace(/^\/+/, '')}`
}

const state = reactive({
  status: 'idle', // idle | loading | ready | offline
  user: null,
  progress: {},
  error: ''
})

let pending = null

function readLocalProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
    return saved && typeof saved === 'object' ? saved : {}
  } catch {
    return {}
  }
}

function writeLocalProgress(value) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(value))
  } catch {
    /* 隐私模式下写入会失败，忽略即可，不影响阅读 */
  }
}

async function request(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options
  })
  // Pages Functions 不存在时拿到的是静态 404 页面，视作离线。
  const type = response.headers.get('content-type') || ''
  if (!response.ok || !type.includes('application/json')) {
    throw new Error(`offline:${response.status}`)
  }
  return response.json()
}

/** 首次进入页面时调用，重复调用共用同一个请求。 */
export function loadSession() {
  if (pending) return pending
  state.status = 'loading'
  state.progress = readLocalProgress()

  pending = request('/auth/me')
    .then((data) => {
      state.user = data.user || null
      state.progress = data.progress || state.progress
      state.status = 'ready'
      return state
    })
    .catch(() => {
      // 离线：不影响阅读，只是不能登录、进度只在本机。
      state.status = 'offline'
      return state
    })

  return pending
}

async function authenticate(path, payload) {
  state.error = ''
  const data = await request(path, { method: 'POST', body: JSON.stringify(payload) })
  state.user = data.user
  state.status = 'ready'
  if (data.progress) state.progress = data.progress
  return data.user
}

export function login(email, password) {
  return authenticate('/auth/login', { email, password })
}

export function register(email, password) {
  return authenticate('/auth/register', { email, password })
}

export async function logout() {
  try {
    await request('/auth/logout', { method: 'POST' })
  } catch {
    /* 离线时本地清理即可 */
  }
  state.user = null
}

export function isDone(layerId, lessonNumber) {
  return Boolean(state.progress[`${layerId}/${lessonNumber}`])
}

/** 勾选/取消一个课时。未登录时写本地，登录后写服务端。 */
export async function toggleLesson(layerId, lessonNumber) {
  const key = `${layerId}/${lessonNumber}`
  const next = { ...state.progress }
  if (next[key]) delete next[key]
  else next[key] = Date.now()
  state.progress = next
  writeLocalProgress(next)

  if (!state.user) return

  try {
    await request('/progress', { method: 'POST', body: JSON.stringify({ key, done: Boolean(next[key]) }) })
  } catch {
    // 服务端不可用时保留本地进度，下次联网再同步。
  }
}

export function completionOf(layer) {
  const done = layer.lessons.filter((l) => isDone(layer.id, l.number)).length
  return { done, total: layer.lessons.length, percent: Math.round((done / layer.lessons.length) * 100) }
}

export const session = readonly(state)
export const isLoggedIn = computed(() => Boolean(state.user))
export const isOffline = computed(() => state.status === 'offline')
