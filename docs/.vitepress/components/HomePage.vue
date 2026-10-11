<script setup>
import { withBase } from 'vitepress'
import { apiUrl } from '../lib/session.js'

const stages = [
  {
    id: 'foundations', number: '01', title: '入门认知', step: '建立认知',
    hint: '心法与学习路线', description: '先看清全貌，再找到自己的起点。',
    chapters: [
      { number: '01', title: '心法与认知', path: '01-mindset' },
      { number: '02', title: '学习路线', path: '02-roadmap' }
    ]
  },
  {
    id: 'technology', number: '02', title: '核心技术', step: '掌握技术',
    hint: '架构、技术底座与 RAG', description: '理解运行原理，搭建关键能力。',
    chapters: [
      { number: '03', title: '架构与核心理论', path: '03-core-theory' },
      { number: '04', title: '关键技术底座', path: '04-tech-foundations' },
      { number: '05', title: '混合 RAG 管道', path: '05-rag-pipeline' }
    ]
  },
  {
    id: 'delivery', number: '03', title: '工程交付', step: '走向交付',
    hint: '编排框架、案例与生产实践', description: '把技术串成项目，走向真实场景。',
    chapters: [
      { number: '06', title: '现代编排框架', path: '06-frameworks' },
      { number: '07', title: '商业实战案例', path: '07-enterprise-cases' },
      { number: '08', title: '生产实践与求职', path: '08-production-career' }
    ]
  }
]

const chapterUrl = (path) => withBase(`/guide/${path}.html`)
// 海报 3.1MB，放 R2 桶里由 /api/files 代取，不进仓库；前缀随 site.base 走。
const posterUrl = apiUrl('/files?path=' + encodeURIComponent('public/images/ai-agent-poster.png'))
const contactUrl = withBase('/author-wechat.png')
</script>

<template>
  <main class="agent-home" aria-labelledby="home-title">
    <section class="home-hero">
      <div class="home-intro">
        <p class="home-eyebrow">全栈开发 <span aria-hidden="true">/</span> 商业落地</p>
        <h1 id="home-title">把 Agent 原理<span>变成可交付的项目</span></h1>
        <p class="home-description">从核心原理、RAG 与工具调用，到工作流编排和生产实践。沿着清晰的路线，逐步搭建你的 Agent 系统。</p>
        <div class="home-actions">
          <a class="home-primary" :href="chapterUrl('01-mindset')">开始学习 <span class="vpi-arrow-right" aria-hidden="true" /></a>
          <a class="home-secondary" :href="chapterUrl('02-roadmap')">查看学习路线 <span class="vpi-arrow-right" aria-hidden="true" /></a>
        </div>
        <ul class="home-facts" aria-label="教程内容">
          <li>8 个章节 + 附录</li><li>14 步学习路线</li><li>配套代码示例</li>
        </ul>
      </div>
      <aside class="home-path" aria-labelledby="home-path-title">
        <div class="home-path-heading">
          <h2 id="home-path-title">你的学习路径</h2><span>循序渐进，学以致用</span>
        </div>
        <ol class="home-path-list">
          <li v-for="stage in stages" :key="stage.id">
            <a :href="`#stage-${stage.id}`">
              <span class="home-step-number" aria-hidden="true">{{ stage.number }}</span>
              <span class="home-step-text"><strong>{{ stage.step }}</strong><span>{{ stage.hint }}</span></span>
              <span class="vpi-arrow-down home-step-arrow" aria-hidden="true" />
            </a>
          </li>
        </ol>
      </aside>
    </section>

    <section id="chapters" class="home-curriculum" aria-labelledby="home-chapters-title">
      <div class="home-section-heading">
        <div><p class="home-eyebrow">从这里开始</p><h2 id="home-chapters-title">一条清晰的学习路线</h2></div>
        <p>按顺序阅读，也可以从你关心的章节开始。</p>
      </div>
      <div class="home-stages">
        <section v-for="stage in stages" :id="`stage-${stage.id}`" :key="stage.id" class="home-stage" :aria-labelledby="`title-${stage.id}`">
          <p class="home-stage-label">阶段 {{ stage.number }}</p>
          <h3 :id="`title-${stage.id}`">{{ stage.title }}</h3>
          <p class="home-stage-description">{{ stage.description }}</p>
          <ul class="home-chapter-list">
            <li v-for="chapter in stage.chapters" :key="chapter.path">
              <a :href="chapterUrl(chapter.path)">
                <span class="home-chapter-number">{{ chapter.number }}</span><span>{{ chapter.title }}</span>
                <span class="vpi-arrow-right" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </section>
      </div>
      <a class="home-appendix" :href="chapterUrl('09-appendix')">
        <span class="home-appendix-label">随用随查</span><span>附录：工程命令与术语速查</span>
        <span class="vpi-arrow-right" aria-hidden="true" />
      </a>
    </section>

    <section class="home-resources" aria-labelledby="home-resources-title">
      <div class="home-resource-copy">
        <p class="home-eyebrow">资料与交流</p>
        <h2 id="home-resources-title">把知识串成体系，把想法做成项目。</h2>
        <p>课程咨询与资料获取，请扫码添加作者微信，备注「AI Agent」。购买与交付事宜直接在微信沟通。</p>
        <a class="home-poster-link" :href="posterUrl" target="_blank" rel="noopener noreferrer">查看高清学习图谱 <span class="vpi-arrow-right" aria-hidden="true" /><span class="home-sr-only">（在新标签页打开）</span></a>
      </div>
      <figure class="home-contact">
        <a :href="contactUrl" target="_blank" rel="noopener noreferrer" aria-label="打开作者微信二维码大图，可保存图片">
          <img :src="contactUrl" alt="作者微信二维码，添加时备注 AI Agent" width="144" height="144" loading="lazy" decoding="async" />
        </a>
        <figcaption>添加作者微信<span>点击大图 · 可保存</span></figcaption>
      </figure>
    </section>
  </main>
</template>

<style>
.agent-home {
  --home-ink: #1f2937;
  --home-muted: #596579;
  --home-brand: #4c5fd5;
  --home-line: #e7eaf0;
  --home-soft: #f6f7fb;
  --home-path-bg: #f5f6fc;
  --home-number-bg: #e8ecfb;
  --home-hover: #edf0fc;
  width: min(1160px, calc(100% - 64px));
  margin: 0 auto;
  padding-bottom: 72px;
  color: var(--home-ink);
  font-size: 16px;
  line-height: 1.7;
}
.dark .agent-home {
  --home-ink: #eceef4;
  --home-muted: #adb6c9;
  --home-brand: #a1afff;
  --home-line: #323641;
  --home-soft: #23252c;
  --home-path-bg: #242732;
  --home-number-bg: #333d61;
  --home-hover: #2d3449;
}
.agent-home p, .agent-home h1, .agent-home h2, .agent-home h3, .agent-home ul, .agent-home ol, .agent-home figure { margin: 0; }
.agent-home ul, .agent-home ol { list-style: none; padding: 0; }
.agent-home a { text-decoration: none; }
.agent-home a:focus-visible { outline: 3px solid var(--home-brand); outline-offset: 5px; border-radius: 6px; }
.agent-home [id] { scroll-margin-top: 100px; }
.agent-home .home-hero { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr); align-items: center; gap: 72px; padding: 88px 0 80px; }
.agent-home .home-eyebrow { color: var(--home-brand); font-size: 13px; font-weight: 600; letter-spacing: .1em; }
.agent-home .home-eyebrow > span { margin: 0 12px; color: var(--home-muted); font-weight: 400; }
.agent-home h1 { margin-top: 20px; font-size: clamp(40px, 4vw, 56px); font-weight: 650; line-height: 1.28; letter-spacing: -.04em; }
.agent-home h1 > span { display: block; }
.agent-home .home-description { max-width: 530px; margin-top: 24px; color: var(--home-muted); font-size: 17px; line-height: 1.85; }
.agent-home .home-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 28px; margin-top: 32px; }
.agent-home .home-primary, .agent-home .home-secondary { display: inline-flex; align-items: center; justify-content: center; gap: 16px; min-height: 48px; font-size: 15px; font-weight: 550; }
.agent-home .home-primary { padding: 0 24px; border-radius: 8px; color: #fff; background: #4c5fd5; transition: background-color .15s; }
.agent-home .home-primary:hover { background: #3d4eb8; }
.agent-home .home-secondary { color: var(--home-muted); }
.agent-home .home-secondary:hover { color: var(--home-brand); }
.agent-home .home-facts { display: flex; flex-wrap: wrap; gap: 8px 0; margin-top: 28px; color: var(--home-muted); font-size: 12px; line-height: 1.4; }
.agent-home .home-facts li + li { border-left: 1px solid var(--home-line); margin-left: 14px; padding-left: 14px; }
.agent-home .home-path { padding: 30px 28px 24px; border-radius: 14px; background: var(--home-path-bg); }
.agent-home .home-path-heading { display: flex; flex-direction: column; gap: 4px; padding: 0 8px 20px; border-bottom: 1px solid var(--home-line); }
.agent-home .home-path-heading h2 { font-size: 17px; font-weight: 600; }
.agent-home .home-path-heading > span { color: var(--home-muted); font-size: 12px; }
.agent-home .home-path-list { padding-top: 12px; }
.agent-home .home-path-list a { display: flex; align-items: center; gap: 18px; min-height: 87px; padding: 12px 8px; border-radius: 8px; transition: background-color .15s; }
.agent-home .home-path-list a:hover { background: var(--home-hover); }
.agent-home .home-step-number { display: grid; place-items: center; flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; background: var(--home-number-bg); color: var(--home-brand); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.agent-home .home-step-text { display: flex; flex-direction: column; gap: 3px; }
.agent-home .home-step-text strong { font-size: 16px; font-weight: 550; }
.agent-home .home-step-text > span { color: var(--home-muted); font-size: 12px; }
.agent-home .home-step-arrow { flex-shrink: 0; margin-left: auto; color: var(--home-muted); font-size: 13px; }
.agent-home .home-curriculum { padding-top: 56px; border-top: 1px solid var(--home-line); }
.agent-home .home-section-heading { display: flex; justify-content: space-between; align-items: end; gap: 20px; }
.agent-home .home-section-heading h2 { margin-top: 10px; font-size: 28px; line-height: 1.4; font-weight: 600; letter-spacing: -.02em; }
.agent-home .home-section-heading > p { padding-bottom: 4px; font-size: 14px; color: var(--home-muted); }
.agent-home .home-stages { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; margin-top: 40px; }
.agent-home .home-stage + .home-stage { border-left: 1px solid var(--home-line); padding-left: 32px; }
.agent-home .home-stage-label { color: var(--home-brand); font-size: 12px; font-weight: 550; letter-spacing: .07em; }
.agent-home .home-stage h3 { margin-top: 8px; font-size: 21px; font-weight: 600; line-height: 1.5; }
.agent-home .home-stage-description { margin-top: 8px; color: var(--home-muted); font-size: 13px; }
.agent-home .home-chapter-list { margin-top: 22px; }
.agent-home .home-chapter-list a { display: flex; align-items: center; gap: 14px; min-height: 53px; padding: 10px 8px; border-bottom: 1px solid var(--home-line); font-size: 15px; transition: color .15s, background-color .15s; }
.agent-home .home-chapter-list a:hover { background: var(--home-soft); color: var(--home-brand); }
.agent-home .home-chapter-number { flex-shrink: 0; color: var(--home-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.agent-home .home-chapter-list .vpi-arrow-right { flex-shrink: 0; margin-left: auto; color: var(--home-muted); font-size: 14px; }
.agent-home .home-appendix { display: flex; align-items: center; gap: 20px; min-height: 64px; margin-top: 32px; padding: 16px 20px; border-radius: 8px; background: var(--home-soft); font-size: 14px; }
.agent-home .home-appendix:hover { background: var(--home-hover); }
.agent-home .home-appendix-label { flex-shrink: 0; color: var(--home-muted); font-size: 12px; }
.agent-home .home-appendix .vpi-arrow-right { flex-shrink: 0; margin-left: auto; color: var(--home-brand); }
.agent-home .home-resources { display: flex; align-items: center; justify-content: space-between; gap: 48px; margin-top: 72px; padding: 40px; border: 1px solid var(--home-line); border-radius: 12px; }
.agent-home .home-resource-copy { max-width: 680px; }
.agent-home .home-resource-copy h2 { margin-top: 12px; font-size: 23px; line-height: 1.5; font-weight: 600; }
.agent-home .home-resource-copy > p:not(.home-eyebrow) { max-width: 550px; margin-top: 14px; color: var(--home-muted); font-size: 14px; }
.agent-home .home-poster-link { display: inline-flex; align-items: center; gap: 12px; min-height: 44px; margin-top: 16px; color: var(--home-brand); font-size: 14px; font-weight: 550; }
.agent-home .home-poster-link:hover { text-decoration: underline; text-underline-offset: 4px; }
.agent-home .home-contact { flex-shrink: 0; text-align: center; }
.agent-home .home-contact > a { display: block; padding: 12px; border: 1px solid var(--home-line); border-radius: 8px; background: #fff; }
.agent-home .home-contact img { display: block; width: 120px; height: 120px; }
.agent-home .home-contact figcaption { margin-top: 10px; font-size: 12px; line-height: 1.7; }
.agent-home .home-contact figcaption > span { display: block; color: var(--home-muted); font-size: 11px; }
.agent-home .home-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (max-width: 1050px) {
  .agent-home .home-hero { gap: 36px; padding: 64px 0; }
  .agent-home h1 { font-size: 42px; }
  .agent-home .home-path { padding: 24px 16px 16px; }
  .agent-home .home-path-list a { gap: 12px; }
  .agent-home .home-section-heading { flex-direction: column; align-items: start; gap: 12px; }
  .agent-home .home-stages { gap: 20px; }
  .agent-home .home-stage + .home-stage { padding-left: 20px; }
}
@media (max-width: 800px) {
  .agent-home .home-hero { grid-template-columns: 1fr; gap: 36px; }
  .agent-home .home-description { max-width: 600px; }
  .agent-home .home-path { padding: 22px 24px 16px; }
  .agent-home .home-path-heading { flex-direction: row; justify-content: space-between; align-items: center; padding: 0 4px 16px; }
  .agent-home .home-path-list { padding-top: 8px; }
  .agent-home .home-path-list a { min-height: 68px; padding: 10px 4px; gap: 16px; }
  .agent-home .home-stages { grid-template-columns: 1fr; gap: 28px; margin-top: 32px; }
  .agent-home .home-stage + .home-stage { padding: 28px 0 0; border-left: 0; border-top: 1px solid var(--home-line); }
  .agent-home .home-chapter-list { margin-top: 14px; }
  .agent-home .home-resources { padding: 28px; gap: 28px; }
  .agent-home .home-resource-copy h2 { font-size: 21px; }
}
@media (max-width: 540px) {
  .agent-home { width: calc(100% - 40px); padding-bottom: 40px; }
  .agent-home .home-hero { padding: 44px 0 40px; gap: 32px; }
  .agent-home h1 { margin-top: 18px; font-size: clamp(28px, 8.6vw, 36px); line-height: 1.35; letter-spacing: -.04em; }
  .agent-home .home-description { margin-top: 20px; font-size: 16px; line-height: 1.8; }
  .agent-home .home-actions { gap: 12px 22px; margin-top: 24px; }
  .agent-home .home-primary { padding: 0 20px; }
  .agent-home .home-facts { margin-top: 22px; font-size: 11px; }
  .agent-home .home-facts li + li { margin-left: 10px; padding-left: 10px; }
  .agent-home .home-path { padding: 20px 16px 12px; border-radius: 10px; }
  .agent-home .home-path-heading h2 { font-size: 15px; }
  .agent-home .home-path-heading > span { font-size: 11px; }
  .agent-home .home-step-number { width: 30px; height: 30px; font-size: 11px; }
  .agent-home .home-step-text strong { font-size: 15px; }
  .agent-home .home-curriculum { padding-top: 36px; }
  .agent-home .home-section-heading h2 { font-size: 25px; }
  .agent-home .home-section-heading > p { font-size: 13px; }
  .agent-home .home-stage-description { font-size: 14px; }
  .agent-home .home-appendix { gap: 12px; padding: 16px 12px; font-size: 13px; }
  .agent-home .home-resources { flex-direction: column; align-items: start; gap: 24px; margin-top: 40px; padding: 24px 20px; }
  .agent-home .home-resource-copy h2 { font-size: 21px; }
  .agent-home .home-contact { display: flex; align-items: center; gap: 20px; text-align: left; }
  .agent-home .home-contact img { width: 112px; height: 112px; }
  .agent-home .home-contact figcaption { margin-top: 0; font-size: 13px; }
  .agent-home .home-contact figcaption > span { margin-top: 6px; font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .agent-home a { transition: none !important; }
}
</style>
