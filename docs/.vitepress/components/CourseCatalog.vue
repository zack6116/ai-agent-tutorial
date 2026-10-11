<script setup>
import { withBase } from 'vitepress'
const courses = [{ title: 'AI Agent 全栈实战', description: '从核心原理到商业落地，系统学习工具调用、RAG、工作流编排与生产实践。', href: '/courses/ai-agent.html', tags: ['Agent 开发', 'RAG', '工程实践'], chapters: '8 章 + 速查附录' }]
</script>

<template>
  <main class="catalog">
    <section class="catalog-hero">
      <p class="eyebrow">专注 AI · 学以致用</p>
      <h1>用 AI 编程，<br>把想法做成产品。</h1>
      <p class="lead">围绕 AI 应用开发与 Agent 实战，用清晰的图文课程，<br class="wide-break">带你理解原理、动手实践，走向真实项目。</p>
      <div class="actions"><a class="primary" href="#courses">浏览课程 <span class="vpi-arrow-down" aria-hidden="true" /></a><a :href="withBase('/guide/02-roadmap.html')">查看学习路线 <span class="vpi-arrow-right" aria-hidden="true" /></a></div>
    </section>
    <section id="courses" aria-labelledby="courses-title">
      <div class="section-heading"><div><p class="eyebrow">课程中心</p><h2 id="courses-title">从一门课，开始动手。</h2></div><span class="muted">图文课程 · 按章节循序学习</span></div>
      <article v-for="course in courses" :key="course.href" class="course">
        <a class="course-cover" :href="withBase(course.href)" tabindex="-1" aria-hidden="true"><span>AI AGENT</span><strong>从原理<br>到交付</strong><small>全栈开发与商业落地</small></a>
        <div class="course-body"><p class="tags"><span v-for="tag in course.tags" :key="tag">{{ tag }}</span></p><h3><a :href="withBase(course.href)">{{ course.title }}</a></h3><p class="course-description">{{ course.description }}</p><p class="course-meta">{{ course.chapters }} · 配套代码示例</p><div class="actions"><a class="primary" :href="withBase(course.href)">查看课程 <span class="vpi-arrow-right" aria-hidden="true" /></a><a :href="withBase('/contact.html')">联系微信咨询</a></div></div>
      </article>
    </section>
    <section class="learning" aria-labelledby="learning-title"><div><p class="eyebrow">学习方式</p><h2 id="learning-title">理解一步，实践一步。</h2></div><ol><li><strong>01 / 先看路线</strong><p>了解知识全貌，找到适合自己的起点。</p></li><li><strong>02 / 跟着章节学</strong><p>结合图文讲解与代码示例，逐步掌握核心能力。</p></li><li><strong>03 / 带进项目里</strong><p>用真实场景串联知识，理解上线与交付的要求。</p></li></ol></section>
    <section class="contact-strip"><div><h2>想了解课程或配套资料？</h2><p>添加作者微信，备注「AI Agent」，直接沟通学习与购买事宜。</p></div><a :href="withBase('/contact.html')">联系微信 <span class="vpi-arrow-right" aria-hidden="true" /></a></section>
  </main>
</template>

<style scoped>
.catalog{--accent:#4c5fd5;--ink:var(--vp-c-text-1);--muted:var(--vp-c-text-2);--line:var(--vp-c-divider);max-width:1120px;width:calc(100% - 64px);margin:auto;color:var(--ink);padding-bottom:64px;line-height:1.7}
.catalog h1,.catalog h2,.catalog h3,.catalog p{margin:0}.catalog a{text-decoration:none}.catalog a:focus-visible{outline:3px solid var(--accent);outline-offset:6px;border-radius:4px}.catalog a:hover{color:var(--accent)}
.catalog-hero{padding:76px 0 68px;max-width:800px}.eyebrow{color:var(--accent);font-size:13px;font-weight:600;letter-spacing:.08em}.catalog h1{font-size:clamp(36px,4.6vw,58px);font-weight:650;line-height:1.25;letter-spacing:-.04em;margin-top:18px}.lead{margin-top:24px!important;font-size:17px;color:var(--muted);line-height:1.9}.actions{display:flex;align-items:center;gap:28px;flex-wrap:wrap;margin-top:28px;font-size:14px;font-weight:550}.actions a,.contact-strip>a{display:inline-flex;align-items:center;gap:12px;min-height:46px}.primary{background:#4c5fd5;color:#fff!important;padding:0 22px;border-radius:8px}.primary:hover{background:#3d4eb8}.section-heading{display:flex;align-items:end;justify-content:space-between;gap:24px}.catalog h2{font-size:26px;font-weight:600;margin-top:8px;letter-spacing:-.02em}.muted{color:var(--muted);font-size:13px}#courses{border-top:1px solid var(--line);padding-top:40px;scroll-margin-top:90px}.course{display:grid;grid-template-columns:300px 1fr;gap:40px;margin-top:30px;border:1px solid var(--line);border-radius:14px;overflow:hidden;padding:24px}.course-cover{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;background:#eef0fc;border-radius:8px;padding:32px;color:#344489!important;min-height:280px}.course-cover>span{font-size:12px;letter-spacing:.2em;font-weight:650}.course-cover strong{font-size:38px;line-height:1.35;margin:18px 0;font-weight:650}.course-cover small{font-size:12px}.course-body{align-self:center;padding:8px 12px 8px 0}.tags{display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--muted)}.course h3{font-size:27px;font-weight:600;margin-top:12px}.course-description{font-size:15px;color:var(--muted);max-width:540px;margin-top:12px!important}.course-meta{font-size:12px;color:var(--muted);margin-top:18px!important}.course .actions{margin-top:22px}.learning{padding:60px 0}.learning ol{display:grid;grid-template-columns:repeat(3,1fr);gap:36px;list-style:none;padding:0;margin:28px 0 0}.learning li{border-top:1px solid var(--line);padding-top:22px}.learning strong{font-size:16px;font-weight:550}.learning li p{font-size:14px;color:var(--muted);margin-top:10px}.contact-strip{display:flex;justify-content:space-between;gap:24px;align-items:center;padding:28px 32px;background:var(--vp-c-bg-soft);border-radius:10px}.contact-strip h2{font-size:20px;margin:0}.contact-strip p{font-size:14px;color:var(--muted);margin-top:8px}.contact-strip>a{font-size:14px;color:var(--accent);flex-shrink:0}.dark .catalog{--accent:#a1afff}.dark .course-cover{background:#272e46;color:#cad2ff!important}
@media(max-width:760px){.catalog{width:calc(100% - 40px)}.catalog-hero{padding:44px 0}.wide-break{display:none}.section-heading{align-items:start;flex-direction:column;gap:12px}.course{grid-template-columns:1fr;gap:22px;padding:20px}.course-cover{min-height:210px;padding:24px}.course-cover strong{font-size:32px}.course-body{padding:0}.course h3{font-size:24px}.learning{padding:40px 0}.learning ol{grid-template-columns:1fr;gap:22px}.contact-strip{align-items:start;flex-direction:column;padding:24px}.catalog h2{font-size:23px}.lead{font-size:16px}.actions{gap:20px}}
</style>
