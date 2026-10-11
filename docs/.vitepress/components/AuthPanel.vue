<script setup>
import { computed, ref } from 'vue'
import { session, isOffline, login, register, logout } from '../lib/session.js'

const emit = defineEmits(['close'])

const mode = ref('login') // login | register
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')

const isRegister = computed(() => mode.value === 'register')
const title = computed(() => (isRegister.value ? '注册一个学习账号' : '登录后继续学习'))

const MIN_PASSWORD = 8

async function submit() {
  error.value = ''
  if (!email.value.includes('@')) {
    error.value = '请填写一个有效的邮箱地址。'
    return
  }
  if (password.value.length < MIN_PASSWORD) {
    error.value = `密码至少需要 ${MIN_PASSWORD} 位。`
    return
  }

  busy.value = true
  try {
    if (isRegister.value) await register(email.value, password.value)
    else await login(email.value, password.value)
    emit('close')
  } catch (err) {
    error.value = err?.message && !String(err.message).startsWith('offline:')
      ? String(err.message)
      : '登录服务暂时不可用，请稍后再试。'
  } finally {
    busy.value = false
  }
}

async function signOut() {
  busy.value = true
  await logout()
  busy.value = false
  emit('close')
}
</script>

<template>
  <section class="auth" aria-labelledby="auth-title">
    <!-- 已登录：显示账号与退出 -->
    <template v-if="session.user">
      <div class="auth-row">
        <div>
          <p class="auth-eyebrow">已登录</p>
          <p class="auth-identity">{{ session.user.email }}</p>
        </div>
        <div class="auth-row-actions">
          <button type="button" class="auth-ghost" :disabled="busy" @click="signOut">退出登录</button>
          <button type="button" class="auth-close" aria-label="关闭面板" @click="emit('close')">✕</button>
        </div>
      </div>
      <p class="auth-hint">学习进度已保存到账号，换台设备登录也能接着学。</p>
    </template>

    <!-- 未登录：登录 / 注册 -->
    <template v-else>
      <header class="auth-head">
        <div>
          <p class="auth-eyebrow">免费学习</p>
          <h2 id="auth-title">{{ title }}</h2>
        </div>
        <button type="button" class="auth-close" aria-label="关闭面板" @click="emit('close')">✕</button>
      </header>

      <p class="auth-lede">
        学习地图永久免费。注册账号只是为了保存你的学习进度，我们不会给你发广告邮件。
      </p>

      <form class="auth-form" @submit.prevent="submit">
        <label class="auth-field">
          <span>邮箱</span>
          <input
            v-model.trim="email"
            type="email"
            name="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
          />
        </label>

        <label class="auth-field">
          <span>密码</span>
          <input
            v-model="password"
            type="password"
            name="password"
            :autocomplete="isRegister ? 'new-password' : 'current-password'"
            :placeholder="isRegister ? `至少 ${MIN_PASSWORD} 位` : '输入密码'"
            :minlength="MIN_PASSWORD"
            required
          />
        </label>

        <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
        <p v-else-if="isOffline" class="auth-error" role="status">
          当前是本地预览模式，登录服务未启动 —— 进度仍会保存在这台浏览器里。
        </p>

        <button type="submit" class="auth-submit" :disabled="busy">
          {{ busy ? '处理中…' : isRegister ? '注册并开始学习' : '登录' }}
        </button>
      </form>

      <p class="auth-switch">
        <template v-if="isRegister">
          已经有账号了？<button type="button" @click="mode = 'login'; error = ''">直接登录</button>
        </template>
        <template v-else>
          还没有账号？<button type="button" @click="mode = 'register'; error = ''">免费注册</button>
        </template>
      </p>
    </template>
  </section>
</template>

<style scoped>
.auth {
  margin-top: 20px;
  padding: 26px 28px;
  border: 1px solid var(--rm-line, #e7eaf0);
  border-radius: 14px;
  background: var(--rm-surface, #fff);
  box-shadow: 0 10px 30px rgba(31, 41, 55, 0.07);
}

.auth-eyebrow {
  color: var(--rm-brand, #4c5fd5);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.09em;
}

.auth-head,
.auth-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.auth-head h2 {
  margin: 8px 0 0;
  font-size: 21px;
  font-weight: 620;
  letter-spacing: -0.02em;
}

.auth-identity {
  margin: 8px 0 0;
  font-size: 15px;
  font-weight: 550;
}

.auth-row-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-ghost,
.auth-close {
  border: 0;
  background: none;
  font: inherit;
  cursor: pointer;
}

.auth-ghost {
  padding: 7px 14px;
  border: 1px solid var(--rm-line, #e7eaf0);
  border-radius: 999px;
  color: var(--rm-muted, #596579);
  font-size: 13px;
}

.auth-ghost:hover {
  border-color: var(--rm-brand, #4c5fd5);
  color: var(--rm-brand, #4c5fd5);
}

.auth-close {
  padding: 4px 8px;
  color: var(--rm-faint, #8b94a6);
  font-size: 15px;
  line-height: 1;
}

.auth-close:hover {
  color: var(--rm-ink, #1f2937);
}

.auth-lede {
  margin: 14px 0 0;
  color: var(--rm-muted, #596579);
  font-size: 14px;
  line-height: 1.75;
}

.auth-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 13px;
  font-weight: 550;
}

.auth-field input {
  padding: 11px 14px;
  border: 1px solid var(--rm-line, #e7eaf0);
  border-radius: 8px;
  background: var(--rm-page, #f7f6f3);
  color: inherit;
  font: inherit;
  font-size: 14px;
  font-weight: 400;
}

.auth-field input:focus {
  border-color: var(--rm-brand, #4c5fd5);
  outline: 2px solid rgba(76, 95, 213, 0.18);
  outline-offset: 0;
}

.auth-error,
.auth-switch {
  grid-column: 1 / -1;
}

.auth-error {
  margin: 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: #fdf0ef;
  color: #a4372c;
  font-size: 13px;
  line-height: 1.65;
}

.auth-submit {
  grid-column: 1 / -1;
  min-height: 46px;
  border: 0;
  border-radius: 8px;
  background: var(--rm-brand, #4c5fd5);
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 550;
  cursor: pointer;
  transition: background-color 0.15s;
}

.auth-submit:hover:not(:disabled) {
  background: var(--rm-brand-strong, #3d4eb8);
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: default;
}

.auth-switch {
  margin: 16px 0 0;
  color: var(--rm-muted, #596579);
  font-size: 13px;
}

.auth-switch button {
  padding: 0;
  border: 0;
  background: none;
  color: var(--rm-brand, #4c5fd5);
  font: inherit;
  font-weight: 550;
  cursor: pointer;
}

.auth-switch button:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth-hint {
  margin: 16px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--rm-line, #e7eaf0);
  color: var(--rm-faint, #8b94a6);
  font-size: 13px;
}

@media (max-width: 640px) {
  .auth {
    padding: 22px 18px;
  }

  .auth-form {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth * {
    transition: none !important;
  }
}
</style>
