<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { quiz, buildPersonalRoute, hours } from '../data/roadmap.js'

const answers = ref({})
const revealed = ref(false)

const complete = computed(() => quiz.every((q) => answers.value[q.id]))
const route = computed(() => (complete.value ? buildPersonalRoute(answers.value) : null))

const lessonHref = (layer, lesson) => withBase(`/learn/${layer.id}/${lesson.number}.html`)

function choose(questionId, value) {
  answers.value = { ...answers.value, [questionId]: value }
  if (quiz.every((q) => answers.value[q.id])) revealed.value = true
}

function reset() {
  answers.value = {}
  revealed.value = false
}
</script>

<template>
  <section class="route" aria-labelledby="route-title">
    <header class="route-head">
      <p class="route-eyebrow">个人路线</p>
      <h2 id="route-title">还是不知道从哪层开始？</h2>
      <p>三个问题，给你一条可以照着走的 7 天起步路线。</p>
    </header>

    <div class="route-body">
      <div class="route-quiz">
        <fieldset v-for="(q, qi) in quiz" :key="q.id" class="route-q">
          <legend><span class="route-q-no">{{ qi + 1 }}</span>{{ q.question }}</legend>
          <div class="route-options">
            <button
              v-for="option in q.options"
              :key="option.value"
              type="button"
              class="route-chip"
              :class="{ 'is-picked': answers[q.id] === option.value }"
              :aria-pressed="answers[q.id] === option.value"
              @click="choose(q.id, option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </fieldset>
      </div>

      <aside class="route-result" aria-live="polite">
        <template v-if="route">
          <header class="route-result-head">
            <p class="route-eyebrow">你的起步路线</p>
            <p class="route-summary">
              从 <strong>{{ route.days[0]?.tasks[0]?.layer.title }}</strong> 开始。
              按每天 <strong>{{ route.pace }}</strong> 分钟算，整条主线约
              <strong>{{ route.totalDays }}</strong> 天、合计
              <strong>{{ hours(route.totalMinutes) }}</strong> 小时。
              <template v-if="route.totalDays > route.days.length">
                下面是前 {{ route.days.length }} 天。
              </template>
            </p>
            <button type="button" class="route-reset" @click="reset">重新选择</button>
          </header>
          <ol class="route-days">
            <li v-for="day in route.days" :key="day.day">
              <p class="route-day-no">DAY {{ day.day }}</p>
              <ul>
                <li v-for="task in day.tasks" :key="`${task.layer.id}-${task.lesson.number}`">
                  <a :href="lessonHref(task.layer, task.lesson)">
                    <span class="route-task-layer">{{ task.layer.layer }}</span>
                    <span>{{ task.lesson.title }}</span>
                  </a>
                </li>
              </ul>
            </li>
          </ol>
        </template>

        <template v-else>
          <p class="route-placeholder">
            <span aria-hidden="true">◷</span>
            选完三个问题，这里会按你的情况排出一条起步路线。
          </p>
          <p class="route-note">
            路线只调整顺序和节奏，不跳过任何一层。基础好的会更快，但该看的都会看到。
          </p>
        </template>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.route {
  margin-top: 80px;
  padding-top: 56px;
  border-top: 1px solid var(--rm-line, #e7eaf0);
}

.route-eyebrow {
  color: var(--rm-brand, #4c5fd5);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.route-head h2 {
  margin: 10px 0 0;
  font-size: 28px;
  font-weight: 620;
  letter-spacing: -0.02em;
}

.route-head > p:last-child {
  margin: 10px 0 0;
  color: var(--rm-muted, #596579);
  font-size: 15px;
}

.route-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 40px;
  margin-top: 36px;
}

.route-q {
  margin: 0 0 26px;
  padding: 0;
  border: 0;
}

.route-q legend {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  color: var(--rm-ink, #1f2937);
  font-size: 15px;
  font-weight: 560;
}

.route-q-no {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--rm-soft, #f6f7fb);
  color: var(--rm-brand, #4c5fd5);
  font-size: 11px;
  font-weight: 650;
}

.route-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.route-chip {
  padding: 8px 15px;
  border: 1px solid var(--rm-line, #e7eaf0);
  border-radius: 999px;
  background: var(--rm-surface, #fff);
  color: var(--rm-muted, #596579);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s, color 0.15s;
}

.route-chip:hover {
  border-color: var(--rm-brand, #4c5fd5);
  color: var(--rm-brand, #4c5fd5);
}

.route-chip.is-picked {
  border-color: var(--rm-brand, #4c5fd5);
  background: var(--rm-brand, #4c5fd5);
  color: #fff;
  font-weight: 550;
}

.route-result {
  align-self: start;
  padding: 26px 24px;
  border: 1px solid var(--rm-line, #e7eaf0);
  border-radius: 14px;
  background: var(--rm-soft, #f6f7fb);
}

.route-result-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--rm-line, #e7eaf0);
}

.route-summary {
  margin: 0;
  color: var(--rm-muted, #596579);
  font-size: 14px;
  line-height: 1.75;
}

.route-summary strong {
  color: var(--rm-ink, #1f2937);
}

.route-reset {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: none;
  color: var(--rm-brand, #4c5fd5);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.route-reset:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.route-days {
  margin: 0;
  padding: 0;
  list-style: none;
}

.route-days > li {
  padding: 14px 0;
  border-bottom: 1px solid var(--rm-line, #e7eaf0);
}

.route-days > li:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.route-day-no {
  margin: 0 0 8px;
  color: var(--rm-faint, #8b94a6);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.1em;
}

.route-days ul {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.route-days a {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: var(--rm-ink, #1f2937);
  font-size: 14px;
  text-decoration: none;
}

.route-days a:hover {
  color: var(--rm-brand, #4c5fd5);
}

.route-task-layer {
  flex-shrink: 0;
  color: var(--rm-faint, #8b94a6);
  font-size: 11px;
}

.route-placeholder {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--rm-muted, #596579);
  font-size: 14px;
  line-height: 1.75;
}

.route-placeholder > span {
  color: var(--rm-brand, #4c5fd5);
  font-size: 20px;
}

.route-note {
  margin: 18px 0 0;
  padding-top: 16px;
  border-top: 1px solid var(--rm-line, #e7eaf0);
  color: var(--rm-faint, #8b94a6);
  font-size: 13px;
  line-height: 1.75;
}

@media (max-width: 860px) {
  .route-body {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}

@media (max-width: 760px) {
  .route {
    margin-top: 56px;
    padding-top: 40px;
  }

  .route-head h2 {
    font-size: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .route * {
    transition: none !important;
  }
}
</style>
