<script setup>
import { ref } from 'vue'
import { withBase } from 'vitepress'
const page = ref(0)
const direction = ref('next')
const topic = ref(0)
let start = null
const topics = [
  { name: '感知', text: '理解任务，把自然语言变成明确的目标。' },
  { name: '检索', text: '从知识库找到依据，让回答有据可循。' },
  { name: '行动', text: '调用工具、执行步骤，把答案变成结果。' }
]
function turn(next) { if(next < 0 || next > 1 || next === page.value) return; direction.value = next > page.value ? 'next' : 'prev'; page.value = next }
function down(e) { if(e.target.closest('a,button')) return; start = {x:e.clientX,y:e.clientY} }
function up(e) { if(!start)return; const dx=e.clientX-start.x,dy=e.clientY-start.y; if(Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy))turn(page.value+(dx<0?1:-1)); start=null }
function key(e){if(e.target.closest('a,button'))return;if(e.key==='ArrowRight'){e.preventDefault();turn(1)}if(e.key==='ArrowLeft'){e.preventDefault();turn(0)}}
</script>
<template>
<main id="courses" class="reading-room">
  <header class="room-heading"><div><p>THE AI FIELDNOTES</p><h1>AI 实战 · 课程刊物</h1></div><span>试阅样刊 / 第 01 期</span></header>
  <section class="book" tabindex="0" aria-label="AI Agent 课程样刊，使用左右方向键翻页" @keydown="key" @pointerdown="down" @pointerup="up" @pointercancel="start=null" @pointerleave="start=null">
    <Transition :name="direction" mode="out-in">
      <div :key="page" class="spread">
        <template v-if="page===0">
          <article class="paper cover">
            <div class="running"><span>AI AGENT / 实战特刊</span><span>VOL. 01</span></div>
            <div class="cover-title"><p class="green">本期主题</p><h2>让 AI，<br>从回答走向行动。</h2><p class="intro">一本关于 Agent 的实践手记。<br>从理解原理，到做出真正可用的系统。</p></div>
            <div class="cover-note"><span class="note-number">08</span><div>章节串起一条学习路径<br><small>原理 · RAG · 编排 · 工程交付</small></div></div>
            <footer class="folio"><span>AI Agent 全栈实战</span><span>01</span></footer>
          </article>
          <article class="paper lab">
            <div class="running"><span>打开一个 Agent 的内部世界</span><span>探索 / 01</span></div>
            <div class="orbit" aria-label="Agent 能力探索"><div class="orbit-ring ring-one"></div><div class="orbit-ring ring-two"></div><div class="core"><span>想法的下一步</span><strong>AGENT</strong><small>理解 · 思考 · 执行</small></div><button v-for="(item,i) in topics" :key="item.name" :class="['node','node-'+i,{selected:topic===i}]" :aria-pressed="topic===i" @click="topic=i"><span>0{{i+1}}</span>{{item.name}}</button><span class="orbit-dot"></span></div>
            <div class="topic-note" aria-live="polite"><span>{{topics[topic].name}}</span><p>{{topics[topic].text}}</p></div>
            <footer class="folio"><span>点击节点，看看它如何工作</span><span>02</span></footer>
          </article>
        </template>
        <template v-else>
          <article class="paper contents">
            <div class="running"><span>CONTENTS / 本期目录</span><span>循序渐进</span></div>
            <p class="green section-label">一条能走通的路</p><h2>先理解，<br>再把它做出来。</h2>
            <nav class="chapter-list" aria-label="精选章节"><a :href="withBase('/guide/01-mindset.html')"><em>01</em><div><strong>心法与认知</strong><small>理解 Agent 与聊天机器人的区别</small></div><span class="vpi-arrow-right" /></a><a :href="withBase('/guide/05-rag-pipeline.html')"><em>05</em><div><strong>混合 RAG 管道</strong><small>给模型一套可靠的知识来源</small></div><span class="vpi-arrow-right" /></a><a :href="withBase('/guide/07-enterprise-cases.html')"><em>07</em><div><strong>商业实战案例</strong><small>把技术放进真实业务场景</small></div><span class="vpi-arrow-right" /></a></nav>
            <footer class="folio"><span>精选章节 · 点击进入正文</span><span>03</span></footer>
          </article>
          <article class="paper invitation">
            <div class="running"><span>FIELD GUIDE / 阅读指南</span><span>从这里开始</span></div>
            <div class="quote-mark">“</div><h2>学会一个概念，<br>就让它解决<br><span>一个实际问题。</span></h2><p class="intro">适合希望系统理解 Agent，<br>并进一步动手开发 AI 应用的学习者。</p><div class="reading-links"><a class="read-button" :href="withBase('/courses/ai-agent.html')">打开完整课程 <span class="vpi-arrow-right" /></a><a :href="withBase('/contact.html')">课程与资料咨询 · 联系微信</a></div>
            <footer class="folio"><span>8 个章节 + 工程速查附录</span><span>04</span></footer>
          </article>
        </template>
      </div>
    </Transition>
  </section>
  <div class="book-controls"><button :disabled="page===0" @click="turn(0)" aria-label="上一组书页"><span class="vpi-arrow-left" /> 上一页</button><div class="position" aria-live="polite"><span>{{page===0?'封面与探索':'目录与导读'}}</span><small>{{page+1}} / 2</small></div><button :disabled="page===1" @click="turn(1)" aria-label="下一组书页">翻开下一页 <span class="vpi-arrow-right" /></button></div>
  <p class="reading-hint">左右拖动翻阅，也可以使用下方按钮。<span>本次先呈现 4 页样刊。</span></p>
</main>
</template>
<style scoped>
.reading-room{color:#283746;background:#f3f5f7;min-height:calc(100vh - 64px);padding:30px 32px 32px;font-family:var(--vp-font-family-base)}.room-heading{max-width:1080px;margin:0 auto 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}.room-heading p{font-size:10px;letter-spacing:.18em;color:#698078;margin:0 0 6px}.room-heading h1{font-size:21px;font-weight:550;margin:0}.room-heading>span{font-size:12px;color:#65727d}.book{max-width:1080px;margin:auto;perspective:1800px;box-shadow:0 22px 45px #26374b12,0 3px 7px #26374b0c;touch-action:pan-y;outline-offset:8px;background:#fff}.spread{display:grid;grid-template-columns:1fr 1fr;transform-origin:left center;min-height:540px}.paper{position:relative;min-width:0;padding:26px 38px 24px;background:#fff;display:flex;flex-direction:column}.paper:first-child{border-right:1px solid #dfe3e8}.paper:nth-child(2){box-shadow:inset 14px 0 18px -20px #24334480}.running,.folio{display:flex;justify-content:space-between;gap:12px;font-size:10px;color:#65727d;letter-spacing:.04em}.running{padding-bottom:16px;border-bottom:1px solid #dfe5e7}.folio{margin-top:auto;padding-top:22px}.green{font-size:12px;color:#327563;font-weight:600}.cover-title{margin-top:45px}.paper h2{font-family:'Songti SC','STSong',serif;font-size:34px;line-height:1.55;font-weight:600;letter-spacing:.025em;margin:12px 0 20px}.intro{font-size:14px;color:#65727d;line-height:1.95;margin:0}.cover-note{display:flex;align-items:center;gap:20px;margin:34px 0 20px;border-top:1px solid #e0e5e6;padding-top:20px;font-size:12px;line-height:1.9}.note-number{font-family:Georgia,serif;font-size:43px;color:#6d67a4}.cover-note small{color:#65727d;font-size:11px}.lab{background:#edf3f0}.orbit{position:relative;height:330px;isolation:isolate;max-width:380px;width:100%;margin:15px auto 0}.orbit-ring{position:absolute;border:1px solid #b6cabe;border-radius:50%;inset:48px 40px;transform:rotate(-25deg)}.ring-two{inset:78px 8px;transform:rotate(32deg);border-color:#c3c5df}.core{position:absolute;inset:103px 80px;display:flex;align-items:center;justify-content:center;flex-direction:column;background:#fff;border:1px solid #dbe4df;box-shadow:7px 10px 0 #d8e5de;border-radius:50%;gap:4px}.core>span,.core small{font-size:10px;color:#617d70}.core strong{font-family:Georgia,serif;font-size:27px;font-weight:400;letter-spacing:.08em;color:#3c6251}.node{position:absolute;background:#fff;padding:12px 16px;border-radius:5px;border:1px solid #cbd8d0;font-size:14px;box-shadow:0 5px 10px #2b57450a;transition:transform .2s,background .2s;color:#30483e;cursor:pointer}.node>span{margin-right:9px;color:#72887b;font-size:10px}.node-0{top:25px;left:38%}.node-1{top:165px;left:0}.node-2{bottom:30px;right:8px}.node:hover{transform:translateY(-4px)}.node.selected{background:#365c4b;color:white;border-color:#365c4b}.node.selected>span{color:#cfdfd5}.orbit-dot{position:absolute;width:12px;height:12px;border-radius:50%;background:#9386b7;right:28px;top:113px}.topic-note{display:flex;gap:14px;align-items:baseline;font-size:12px;min-height:55px;margin-top:8px}.topic-note>span{color:#32614c;flex-shrink:0;font-weight:600}.topic-note p{margin:0;color:#52675c;line-height:1.8}.section-label{margin:28px 0 0}.contents h2{font-size:30px;margin:10px 0 16px}.chapter-list a{display:flex;align-items:center;gap:16px;padding:17px 0;border-bottom:1px solid #e5e6eb;text-decoration:none}.chapter-list em{font-family:Georgia,serif;font-size:21px;color:#8c80b4;font-style:normal}.chapter-list strong{display:block;font-size:14px;font-weight:550}.chapter-list small{display:block;font-size:11px;color:#68757c;margin-top:4px}.chapter-list a>span{margin-left:auto;color:#8c80b4}.chapter-list a:hover strong{color:#716292}.invitation{background:#f3f0f8}.quote-mark{font:72px Georgia,serif;color:#9e91bb;height:68px;margin-top:26px}.invitation h2{font-size:29px;margin:0 0 20px}.invitation h2 span{color:#79699b}.reading-links{display:flex;flex-direction:column;gap:15px;margin:28px 0 20px;font-size:12px;align-items:start}.read-button{display:flex;align-items:center;gap:22px;background:#64567f;padding:12px 18px;color:white;border-radius:4px}.reading-links>a:last-child{color:#665d73}.book-controls{max-width:1080px;margin:22px auto 0;display:flex;justify-content:space-between;align-items:center;gap:14px}.book-controls button{display:flex;align-items:center;gap:9px;border:1px solid #d6dde0;border-radius:5px;background:white;padding:10px 16px;font-size:12px;cursor:pointer;color:#3e525f;transition:background .2s}.book-controls button:disabled{opacity:.38;cursor:default}.book-controls button:not(:disabled):hover{background:#e8edf0}.position{display:flex;gap:16px;font-size:12px;color:#63727c}.position small{font-size:12px;color:#87939b}.reading-hint{text-align:center;font-size:11px;color:#73818a;margin:16px 0 0}.reading-hint span{margin-left:12px}.next-enter-active,.prev-enter-active,.next-leave-active,.prev-leave-active{transition:transform .32s ease,opacity .32s}.next-leave-to{transform:rotateY(-18deg);opacity:0}.next-enter-from{transform:rotateY(14deg);opacity:0}.prev-leave-to{transform:rotateY(18deg);opacity:0}.prev-enter-from{transform:rotateY(-14deg);opacity:0}button:focus-visible,a:focus-visible{outline:3px solid #9f8ec5;outline-offset:4px}
/* Editorial color study: dark cover, vivid mint diagram, warm paper interior. */
.reading-room{background:#e4e9ed}
.cover{background:#192c49;color:#fff}
.cover .running,.cover .folio{color:#b8c8dd}
.cover .running,.cover-note{border-color:#ffffff30}
.cover .green{color:#ffb56b}
.cover h2{color:#fff}
.cover .intro{color:#d1dcec}
.cover .note-number{color:#ffad62}
.cover-note small{color:#aebed3}
.cover-title{border-left:4px solid #ffad62;padding-left:22px}
.lab{background:#bce9ce}
.lab .running,.lab .folio{color:#365e50}
.lab .running{border-color:#275e4433}
.orbit-ring{border-color:#56977c}
.ring-two{border-color:#687ab4}
.core{background:#192c49;border-color:#192c49;box-shadow:10px 13px 0 #73b795}
.core strong{color:#fff}
.core>span,.core small{color:#bde9ce}
.node{border-color:#90bfa7;background:#f8fff9;color:#234936;box-shadow:0 6px 0 #80b69a55}
.node.selected{background:#ffad62;color:#192c49;border-color:#e49b56;box-shadow:0 6px 0 #af7c4740}
.node.selected>span{color:#604126}
.orbit-dot{background:#f88653;width:18px;height:18px}
.topic-note{border-top:1px solid #275e4433;padding-top:18px}
.topic-note>span,.topic-note p{color:#244e3c}
.contents{background:#fffdf8}
.contents .green{color:#a94b20}
.chapter-list em{color:#b65326}
.chapter-list a>span{color:#b65326}
.invitation{background:#3e3b88;color:#fff}
.invitation .running,.invitation .folio{color:#cecff0}
.invitation .running{border-color:#ffffff30}
.invitation h2{color:#fff}
.invitation h2 span{color:#ffd19c}
.invitation .intro{color:#dcddf2}
.quote-mark{color:#ffb96e}
.read-button{background:#ffbf7b;color:#25294b;font-weight:600}
.reading-links>a:last-child{color:#ecebff}
.book-controls button:not(:disabled){background:#192c49;border-color:#192c49;color:white}
.book-controls button:not(:disabled):hover{background:#34496a}
@media(max-width:760px){.reading-room{padding:22px 16px}.room-heading{align-items:start}.room-heading h1{font-size:18px}.room-heading>span{font-size:10px}.spread{grid-template-columns:1fr}.paper{padding:24px;min-height:470px}.paper:first-child{border-right:0;border-bottom:1px solid #dfe3e8}.paper h2{font-size:30px}.paper:nth-child(2){box-shadow:none}.cover-title{margin-top:28px}.orbit{max-width:360px}.book-controls button{padding:10px;font-size:11px}.position{gap:6px;font-size:10px;flex-direction:column;text-align:center}.reading-hint span{display:block;margin:5px 0 0}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important}}
</style>
