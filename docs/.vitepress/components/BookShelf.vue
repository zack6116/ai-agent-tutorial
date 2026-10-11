<script setup>
import { onMounted, ref } from 'vue'
import { withBase, useRouter } from 'vitepress'
import books from '../data/books.js'
const progress=ref({})
const router=useRouter()
async function openBook(event,book){
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return
  event.preventDefault()
  // Request fullscreen within the original click; route changes lose user activation.
  try{await document.documentElement.requestFullscreen({navigationUI:'hide'})}catch{}
  await router.go(withBase(`${book.href}?reading=1`))
}
onMounted(()=>{
  for(const book of books){
    try{const saved=JSON.parse(localStorage.getItem(book.progressKey)||'null');if(saved?.cardId)progress.value[book.id]=true}catch{}
  }
})
</script>

<template>
 <main class="library">
  <header class="library-intro">
   <div><p class="eyebrow">THE AI BOOKSHELF / AI 编程书房</p><h1>你的 AI 实战书柜</h1><p class="intro">选一本感兴趣的书，把一个想法慢慢做出来。</p></div>
   <span class="collection-count">藏书 <strong>{{String(books.length).padStart(2,'0')}}</strong></span>
  </header>
  <section class="map-teaser" aria-labelledby="map-teaser-title">
   <div class="map-teaser-copy">
    <p class="eyebrow">LEARNING ROADMAP / 零基础学习地图</p>
    <h2 id="map-teaser-title">从零基础，到做出第一个 AI 产品</h2>
    <p>六个阶段、22 节课，按顺序走一遍，每阶段都有一件做完就能看见的成果。地图免费查看，课程登录后学习，进度自动保存。</p>
   </div>
   <div class="map-teaser-actions">
    <a class="map-teaser-primary" :href="withBase('/roadmap/')">看学习地图 <span aria-hidden="true">→</span></a>
    <a class="map-teaser-ghost" :href="withBase('/learn/')">进入免费学习区</a>
   </div>
  </section>
  <section id="courses" class="cabinet" aria-label="AI 编程课程书柜">
   <div class="cabinet-top"><span>第一格 / AI 应用与智能体</span><span>翻开一本，开始探索</span></div>
   <div class="shelf-bay">
    <article v-for="(book,i) in books" :key="book.id" class="book-slot" :style="{'--cover':book.color}">
     <a class="book" :href="withBase(book.href)" @click="openBook($event,book)" :aria-label="`打开《${book.title} ${book.subtitle}》`">
      <span class="book-spine" aria-hidden="true">AI FIELDNOTES <span>{{String(i+1).padStart(2,'0')}}</span></span>
      <div class="book-cover"><span class="cover-edition">AI PROGRAMMING / VOL. {{String(i+1).padStart(2,'0')}}</span><span class="cover-rule"/><h2>{{book.title}}<span>{{book.subtitle}}</span></h2><p>{{book.label}}</p><div class="cover-diagram" aria-hidden="true"><span>想法</span><i>→</i><span>构建</span><i>→</i><span>交付</span></div><div class="cover-bottom"><span>手绘知识 · 动手实践</span><strong>{{String(i+1).padStart(2,'0')}}</strong></div></div>
      <span class="book-pages" aria-hidden="true"/>
     </a>
     <div class="book-caption"><span>{{book.chapters}} · {{book.cards}} 张知识卡</span><a :href="withBase(book.href)" @click="openBook($event,book)">{{progress[book.id]?'接着上次读':'翻开这本书'}} <span aria-hidden="true">↗</span></a></div>
     <p class="book-description">{{book.description}}</p>
    </article>
    <div class="shelf-space" aria-label="后续课程的位置"><span class="space-line"/><p>下一本，留在这里。</p><span>这个书柜会慢慢长大</span></div>
   </div>
   <div class="wood-shelf" aria-hidden="true"/>
   <div class="cabinet-foot"><span>一本书，一段完整的学习旅程。</span><a :href="withBase('/contact.html')">课程咨询 · 联系微信 ↗</a></div>
  </section>
  <p class="library-note">自由翻阅，无需登录。阅读位置会保存在当前浏览器。</p>
 </main>
</template>

<style scoped>
.library{min-height:calc(100vh - 64px);padding:56px max(24px,calc((100vw - 1160px)/2)) 48px;background:#f4f1e9;color:#263e37}.library-intro{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:34px;gap:24px}.eyebrow{font-size:11px;letter-spacing:.14em;color:#718176;margin:0 0 16px}h1{font-size:32px;line-height:1.4;font-weight:600;font-family:'Kaiti SC','STKaiti',serif;margin:0 0 12px}.intro{font-size:14px;color:#6b776e;margin:0;line-height:1.8}.collection-count{font-size:12px;color:#778278;white-space:nowrap}.collection-count strong{font:36px Georgia,serif;color:#355849;margin-left:10px}.cabinet{border:1px solid #c8b99f;border-radius:10px;background:#e5ddcd;box-shadow:0 16px 40px #3b37200b;overflow:hidden;scroll-margin-top:90px}.cabinet-top{display:flex;justify-content:space-between;gap:20px;padding:18px 30px;background:#ede5d6;border-bottom:1px solid #cbbca3;font-size:12px;color:#746853}.cabinet-top span:last-child{color:#92816a}.shelf-bay{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:44px;padding:50px 44px 34px;box-shadow:inset 0 18px 30px #57462b0e;background:linear-gradient(90deg,#d9d0bc44,transparent 12%,transparent 88%,#d9d0bc66)}.book-slot{min-width:0}.book{position:relative;display:flex;width:100%;max-width:290px;aspect-ratio:3/4;margin:auto;text-decoration:none;filter:drop-shadow(12px 15px 9px #2e382f24);transform:rotate(-2deg);transform-origin:bottom center;transition:transform .35s,filter .35s;isolation:isolate}.book:hover{transform:translateY(-10px) rotate(0deg);filter:drop-shadow(14px 22px 12px #2e382f2b)}.book:focus-visible,.book-caption a:focus-visible,.cabinet-foot a:focus-visible{outline:3px solid #b27432;outline-offset:7px}.book-spine{width:26px;flex-shrink:0;writing-mode:vertical-rl;background:#153c32;color:#c1cfad;font-size:9px;letter-spacing:.15em;padding:22px 7px;display:flex;justify-content:space-between;border-radius:4px 0 0 4px;border-right:1px solid #ffffff24}.book-cover{flex:1;min-width:0;position:relative;background:var(--cover);color:#f5ecd3;border-radius:0 5px 5px 0;padding:22px 22px 16px;box-shadow:inset 3px 0 6px #102f3640,inset -1px 0 #ffffff22;display:flex;flex-direction:column;border:1px solid #163b3144}.cover-edition{font-size:8px;letter-spacing:.13em;color:#cad3b8}.cover-rule{display:block;height:1px;background:#d8c58d66;margin-top:15px}.book-cover h2{font:600 clamp(24px,2.6vw,34px)/1.3 Georgia,'Kaiti SC','STKaiti',serif;margin:24px 0 0;letter-spacing:-.02em}.book-cover h2 span{display:block;font-family:'Kaiti SC','STKaiti',serif;font-size:.86em;letter-spacing:.1em;margin-top:8px}.book-cover p{font-size:11px;letter-spacing:.1em;color:#c0c9ac;margin-top:13px}.cover-diagram{display:flex;align-items:center;gap:6px;margin:auto 0;font-size:10px}.cover-diagram span{display:grid;place-items:center;aspect-ratio:1;border:1px solid #cbbc89;width:29%;border-radius:50%;color:#e2d6b4}.cover-diagram i{font-style:normal;color:#cbbc89}.cover-bottom{display:flex;align-items:end;justify-content:space-between;border-top:1px solid #d8c58d55;padding-top:13px;font-size:9px;color:#c0c9ac}.cover-bottom strong{font:30px Georgia,serif;color:#e2d6b4}.book-pages{position:absolute;bottom:-4px;left:27px;right:3px;height:6px;background:repeating-linear-gradient(#f4eddd 0 1px,#b9b3a2 1px 2px);z-index:-1;border-radius:0 0 3px 3px}.book-caption{margin-top:26px;display:flex;flex-direction:column;gap:10px;font-size:11px;color:#776d5a}.book-caption a{font-size:14px;color:#235a4c;text-decoration:none;display:flex;justify-content:space-between;align-items:center;min-height:32px}.book-description{font-size:12px;line-height:1.9;color:#7a7567;margin:9px 0 0}.shelf-space{grid-column:2 / -1;align-self:center;justify-self:center;text-align:center;color:#9b907b;padding:40px}.space-line{display:block;width:70px;height:1px;background:#b5a990;margin:0 auto 22px}.shelf-space p{font-family:'Kaiti SC','STKaiti',serif;font-size:23px;margin:0 0 12px}.shelf-space>span:last-child{font-size:12px;letter-spacing:.08em}.wood-shelf{height:19px;border-top:2px solid #d9c59f;border-bottom:1px solid #a38a60;background:linear-gradient(#c9b087,#b69b70);box-shadow:0 7px 10px #806b4520}.cabinet-foot{display:flex;justify-content:space-between;gap:20px;padding:26px 30px;background:#ede5d6;font-size:12px;color:#867962}.cabinet-foot a{color:#526653;text-decoration:none}/* 书柜之上的一条入口：把免费的「学习地图」摆出来，不让它只藏在导航里。 */
.map-teaser{display:flex;align-items:center;justify-content:space-between;gap:32px;margin-bottom:26px;padding:26px 30px;border:1px solid #c8b99f;border-left:4px solid #355849;border-radius:10px;background:#ede5d6;box-shadow:0 10px 26px #3b37200b}
.map-teaser-copy{min-width:0}
.map-teaser-copy .eyebrow{margin-bottom:10px}
.map-teaser-copy h2{font:600 clamp(20px,2.1vw,26px)/1.4 'Kaiti SC','STKaiti',serif;color:#263e37;margin:0 0 10px;letter-spacing:-.01em}
.map-teaser-copy p{font-size:13px;line-height:1.85;color:#6b776e;margin:0;max-width:60ch}
.map-teaser-actions{display:flex;flex-direction:column;gap:10px;flex-shrink:0}
.map-teaser-primary,.map-teaser-ghost{display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:44px;padding:0 20px;border-radius:8px;font-size:14px;text-decoration:none;white-space:nowrap;transition:background-color .2s,color .2s}
.map-teaser-primary{background:#355849;color:#f4f1e9;font-weight:550}
.map-teaser-primary:hover{background:#28453a}
.map-teaser-ghost{border:1px solid #bdae94;color:#4a6157}
.map-teaser-ghost:hover{border-color:#355849;color:#263e37}
.map-teaser-primary:focus-visible,.map-teaser-ghost:focus-visible{outline:3px solid #b27432;outline-offset:3px}
.library-note{text-align:center;font-size:12px;color:#8b8c7f;margin:26px 0 0;line-height:1.8}@media(max-width:900px){.shelf-bay{grid-template-columns:repeat(2,minmax(0,1fr));padding:36px 28px;gap:30px}.book-cover h2{font-size:32px}.shelf-space{grid-column:2;padding:20px}}@media(max-width:600px){.library{padding:28px 18px 32px}.library-intro{gap:10px;margin-bottom:24px}h1{font-size:27px}.eyebrow{font-size:10px}.intro{font-size:13px}.collection-count{display:none}.cabinet-top{padding:16px 18px;font-size:12px}.cabinet-top span:last-child{display:none}.shelf-bay{grid-template-columns:1fr;padding:34px 26px 24px;gap:28px}.book{max-width:260px}.book-cover h2{font-size:31px}.book-caption,.book-description{max-width:260px;margin-left:auto;margin-right:auto}.shelf-space{grid-column:auto;padding:4px 0 0;text-align:left;justify-self:start}.space-line,.shelf-space>span:last-child{display:none}.shelf-space p{font:12px/1.6 inherit;margin:0;color:#9b907b}.cabinet-foot{padding:18px;flex-direction:column;gap:10px;font-size:12px}.library-note{font-size:11px}.map-teaser{flex-direction:column;align-items:stretch;gap:20px;padding:22px 18px}.map-teaser-actions{flex-direction:row}.map-teaser-actions a{flex:1;justify-content:center}}@media(prefers-reduced-motion:reduce){.book,.map-teaser-primary,.map-teaser-ghost{transition:none}}
</style>
