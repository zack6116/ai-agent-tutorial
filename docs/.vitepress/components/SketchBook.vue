<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import ReadingMusic from './ReadingMusic.vue'
import data from '../data/course-book.js'
import { renderCard, renderMobileCard } from '../lib/sketch-card.js'
const index=ref(0), direction=ref('forward'), isTurning=ref(false), isDragging=ref(false), dragOffset=ref(0)
const progressMessage=ref('阅读位置自动保存在此浏览器')
const progressKey='ai-agent-book-progress-v1'
let progressReady=false
function saveProgress(){
  if(!progressReady)return
  try{
    localStorage.setItem(progressKey,JSON.stringify({cardId:data.cards[index.value]?.id||'author-ending',updatedAt:Date.now()}))
    progressMessage.value=index.value===data.cards.length?'已读完 · 下次回到后记':`已保存到第 ${index.value+1} 张 · 下次接着看`
  }catch{progressMessage.value='浏览器未允许保存，本次进度无法保留'}
}
watch(index,saveProgress,{flush:'sync'})
const reader=ref(null), cardStack=ref(null), isFullscreen=ref(false)
const fullscreenMessage=ref('')
const isEnding=computed(()=>index.value===data.cards.length)
const card=computed(()=>data.cards[Math.min(index.value,data.cards.length-1)])
const chapterIndex=computed(()=>card.value.chapter)
const chapter=computed(()=>data.chapters[chapterIndex.value])
const chapterCards=computed(()=>data.cards.map((item,i)=>({...item,index:i})).filter(item=>item.chapter===chapterIndex.value))
const mobileSvg=computed(()=>renderMobileCard(card.value,chapter.value.title,index.value,data.cards.length))
const svg=computed(()=>renderCard(card.value,data.chapters[card.value.chapter].title,index.value,data.cards.length))
let pointer=null
let nativeFullscreen=false
const dragStyle=computed(()=>({
  '--drag-x': `${dragOffset.value}px`,
  '--drag-turn': `${Math.max(-7, Math.min(7, dragOffset.value / 18))}deg`
}))
function select(n,delta){if(n===index.value||isTurning.value)return;direction.value=(delta??(n-index.value))>0?'forward':'backward';isTurning.value=true;index.value=n}
function turn(delta){select(Math.max(0,Math.min(data.cards.length,index.value+delta)),delta)}
function selectChapter(e){select(data.cards.findIndex(item=>item.chapter===Number(e.target.value)))}
function down(e){if(isTurning.value||!e.isPrimary||e.button!==0)return;pointer={x:e.clientX,y:e.clientY};isDragging.value=true;e.currentTarget.setPointerCapture?.(e.pointerId)}
function move(e){if(!pointer||!isDragging.value)return;dragOffset.value=Math.max(-90,Math.min(90,e.clientX-pointer.x))}
function release(){pointer=null;isDragging.value=false;dragOffset.value=0}
function up(e){if(!pointer)return;const x=e.clientX-pointer.x,y=e.clientY-pointer.y;release();if(Math.abs(x)>60&&Math.abs(x)>Math.abs(y))turn(x<0?1:-1)}
function finishTurn(){isTurning.value=false}
function handleFullscreenChange(){
  const active=!!document.fullscreenElement
  if(active) nativeFullscreen=true
  // Browser-initiated exits keep the book open; only the directory control returns to navigation.
  if(nativeFullscreen&&!document.fullscreenElement)nativeFullscreen=false
}
function handleWindowKey(e){
  if(!isFullscreen.value||e.defaultPrevented)return
  if(e.key==='ArrowLeft'){e.preventDefault();turn(-1)}
  if(e.key==='ArrowRight'){e.preventDefault();turn(1)}
  if(e.key==='Escape'&&!document.fullscreenElement){e.preventDefault();exitFullscreen()}
}
async function enterFullscreen(){
  fullscreenMessage.value=''
  try{
    if(!reader.value?.requestFullscreen)throw new Error('unsupported')
    await reader.value.requestFullscreen({navigationUI:'hide'})
    isFullscreen.value=true
  }catch{
    fullscreenMessage.value='未能进入整屏阅读，请在独立 Chrome 浏览器中打开后重试，并允许全屏。'
    return
  }
  await nextTick()
  cardStack.value?.focus()
}
async function exitFullscreen(){
  if(document.fullscreenElement){try{await document.exitFullscreen()}catch{}}
  isFullscreen.value=false
}
function toggleFullscreen(){isFullscreen.value?exitFullscreen():enterFullscreen()}
watch(isFullscreen,(active)=>{
  document.documentElement.classList.toggle('sketch-fullscreen',active)
})
onMounted(()=>{
  if(new URLSearchParams(window.location.search).get('reading')==='1'){
    isFullscreen.value=true
    nativeFullscreen=!!document.fullscreenElement
    nextTick(()=>cardStack.value?.focus())
  }
  const slug=new URLSearchParams(window.location.search).get('chapter')
  const initial=data.cards.findIndex(item=>data.chapters[item.chapter].slug===slug)
  let savedIndex=-1
  try{
    const saved=JSON.parse(localStorage.getItem(progressKey)||'null')
    savedIndex=data.cards.findIndex(item=>item.id===saved?.cardId)
    if(saved?.cardId==='author-ending')savedIndex=data.cards.length
  }catch{}
  // Explicit chapter links take precedence over the saved reading position.
  if(initial>=0)index.value=initial
  else if(savedIndex>=0)index.value=savedIndex
  progressReady=true
  saveProgress()
  if(initial<0&&savedIndex>=0&&savedIndex<data.cards.length&&progressMessage.value.startsWith('已保存')){
    progressMessage.value=`已接着上次读到的第 ${index.value+1} 张`
  }
  document.addEventListener('fullscreenchange',handleFullscreenChange)
  window.addEventListener('keydown',handleWindowKey)
})
onBeforeUnmount(()=>{
  document.removeEventListener('fullscreenchange',handleFullscreenChange)
  window.removeEventListener('keydown',handleWindowKey)
  document.documentElement.classList.remove('sketch-fullscreen')
})
</script>
<template>
<main class="sketch-room">
 <div class="sketch-layout">
  <aside id="courses" class="book-guide"><p class="edition">AI FIELDNOTES / 学习绘本</p><h1>翻一张，<br><span>学会一点。</span></h1><p class="description">AI Agent 全栈实战<br>从第一个工具调用，到完整项目交付。</p><div class="sample-label">8 章课程 + 工程附录 · {{data.cards.length}} 张知识卡</div><label class="chapter-label" for="book-chapter">选择章节</label><select id="book-chapter" class="chapter-select" :value="chapterIndex" :disabled="isTurning" @change="selectChapter"><option v-for="(item,i) in data.chapters" :key="item.slug" :value="i">{{i===8?'附录':`第 ${i+1} 章`}} · {{item.title}}</option></select><details class="chapter-directory" open><summary>本章卡片 · {{chapterCards.length}} 张</summary><nav aria-label="知识卡片目录"><button v-for="(item,i) in chapterCards" :key="item.id" :disabled="isTurning" :aria-current="index===item.index?'page':undefined" @click="select(item.index)"><span>{{String(i+1).padStart(2,'0')}}</span><span>{{item.title}}</span><span v-if="index===item.index" class="vpi-arrow-right" aria-hidden="true" /></button></nav></details><a class="source" :href="withBase(`/guide/${chapter.slug}.html`)">阅读本章完整讲解与代码 <span class="vpi-arrow-right" aria-hidden="true" /></a><a class="source course-contact" :href="withBase('/contact')">课程咨询 · 联系微信</a><div class="guide-note"><strong>把知识翻进脑海</strong><p>一张卡片，专注一个问题。<br>每章搭配完整讲解与动手练习。</p></div></aside>
  <section ref="reader" :class="['card-stage',{ 'fullscreen-reader':isFullscreen }]" aria-label="翻阅知识卡片">
   <div class="reading-options"><button v-if="isFullscreen" class="return-directory" @click="exitFullscreen" aria-label="返回课程目录">☷ 目录</button><ReadingMusic /><p class="login-note" role="status">{{progressMessage}}<span>无需登录 · 仅保存在当前浏览器</span></p></div>
   <p v-if="fullscreenMessage" class="card-status" role="alert">{{fullscreenMessage}}</p>
   <div class="stage-heading"><span>{{chapter.title}} / 手绘图解</span><span class="heading-actions"><span aria-live="polite">{{isEnding?'后记':`${index+1} / ${data.cards.length}`}}</span><button class="enter-fullscreen" type="button" :aria-label="isFullscreen?'退出全屏阅读':'进入全屏阅读'" @click.stop="toggleFullscreen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg><span>{{isFullscreen?'退出全屏':'全屏阅读'}}</span></button></span></div>
   <button v-if="isFullscreen" class="exit-fullscreen" type="button" aria-label="退出全屏阅读" title="退出全屏" @click="exitFullscreen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg></button>
   <button v-if="isFullscreen" class="page-hotspot previous" type="button" :disabled="isTurning" aria-label="上一张卡片" @click.stop="turn(-1)"><span class="vpi-arrow-left" aria-hidden="true" /></button>
   <div ref="cardStack" :class="['card-stack', direction, { turning:isTurning, dragging:isDragging }]" :style="dragStyle" tabindex="0" aria-label="知识卡片，左右方向键翻阅" @keydown.left.prevent="turn(-1)" @keydown.right.prevent="turn(1)" @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="release">
    <Transition :name="direction" @after-enter="finishTurn"><div :key="isEnding?'author-ending':card.id" class="knowledge-card"><div v-if="isEnding" class="author-ending"><p class="ending-label">AFTERWORD / 写在最后</p><h2>这一页，是新的开始。</h2><p>谢谢你读完这本书。<br>带着一个想法，去做一个自己的 AI 项目吧。</p><img :src="withBase('/author-wechat.png')" alt="作者微信二维码，添加时备注 AI Agent" draggable="false" @pointerdown.stop><strong>扫码，与作者聊聊</strong><p class="ending-note">添加时备注「AI Agent」<br>交流学习心得，也欢迎告诉我你的作品。</p><a :href="withBase('/author-wechat.png')" target="_blank" rel="noopener" @pointerdown.stop>打开二维码大图 ↗</a></div><template v-else><div class="desktop-card" v-html="svg"></div><div class="mobile-card" v-html="mobileSvg"></div></template></div></Transition>
    <span class="page-edge" aria-hidden="true"></span>
   </div>
   <button v-if="isFullscreen" class="page-hotspot next" type="button" :disabled="isTurning||isEnding" aria-label="下一张卡片" @click.stop="turn(1)"><span class="vpi-arrow-right" aria-hidden="true" /></button>
   <div class="card-controls"><button :disabled="isTurning" @click="turn(-1)" aria-label="上一张卡片"><span class="vpi-arrow-left" /> 上一张</button><span class="card-counter"><i :class="{active:isTurning}" aria-hidden="true"></i>{{isEnding?'后记':`${index+1} / ${data.cards.length}`}}</span><button :disabled="isTurning||isEnding" @click="turn(1)" aria-label="下一张卡片">下一张 <span class="vpi-arrow-right" /></button></div>
   <p class="card-status" role="status">左右拖动或按方向键翻阅</p>
   <div v-if="isFullscreen" class="fullscreen-counter" aria-live="polite"><i :class="{active:isTurning}" aria-hidden="true"></i>{{isEnding?'后记':`${index+1} / ${data.cards.length}`}}</div>
  </section>
 </div>
</main>
</template>
<style scoped>
.author-ending{aspect-ratio:860/1120;height:100%;box-sizing:border-box;background:#fffdf5;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:7%;color:#294b40;gap:12px}
.author-ending .ending-label{font-size:10px;letter-spacing:.15em;color:#8c826d;margin:0}
.author-ending h2{font:600 clamp(19px,2.2vw,30px)/1.5 'Kaiti SC','STKaiti',serif;margin:10px 0}
.author-ending p{font-size:clamp(11px,1.1vw,15px);line-height:1.9;margin:0;color:#718075}
.author-ending img{width:65%;max-width:280px;height:auto;object-fit:contain;background:white;padding:10px;margin:6px 0;border:1px solid #e4decb;border-radius:8px;touch-action:auto}
.author-ending strong{font-size:15px;font-weight:500}.author-ending a{font-size:12px;text-decoration:underline;text-underline-offset:4px;margin-top:8px}
@media(max-width:600px){.author-ending{aspect-ratio:600/980;gap:10px}.author-ending img{width:78%}.author-ending .ending-note{font-size:11px}}
</style>
<style scoped>
.card-stage.fullscreen-reader .reading-options{display:flex;position:absolute;z-index:25;top:max(14px,env(safe-area-inset-top));left:max(14px,env(safe-area-inset-left));gap:12px;opacity:.35;transition:opacity .25s}
.card-stage.fullscreen-reader .reading-options:hover,.card-stage.fullscreen-reader .reading-options:focus-within{opacity:1}
.card-stage.fullscreen-reader .reading-options .login-note{display:none}
.return-directory{min-height:44px;padding:8px 12px;color:#f5f0df;background:#ffffff0d;border:1px solid #ffffff22;border-radius:24px;font-size:12px;cursor:pointer}
.card-stage.fullscreen-reader :deep(.reading-music){display:flex}
.card-stage.fullscreen-reader :deep(.reading-music button){color:#f5f0df;background:#ffffff0d;border:1px solid #ffffff22}
@media(hover:none){.card-stage.fullscreen-reader .reading-options{opacity:.65}}
</style>
<style scoped>
.sketch-room{background:#e8ede8;color:#253d4b;padding:36px 36px 48px;min-height:calc(100vh - 64px)}.sketch-layout{max-width:1160px;margin:auto;display:grid;grid-template-columns:330px minmax(0,1fr);gap:72px;align-items:start}.book-guide{position:sticky;top:105px;padding-top:22px}.edition{font-size:11px;letter-spacing:.12em;color:#50796e}.book-guide h1{font-family:'Kaiti SC','STKaiti','KaiTi',serif;font-size:38px;line-height:1.5;font-weight:600;margin:22px 0 18px}.book-guide h1 span{color:#28725d}.description{font-size:14px;line-height:1.95;color:#5c706f}.sample-label{font-size:12px;margin:32px 0 12px;color:#59716a}nav{border-top:1px solid #bdcfc5}nav button{display:flex;align-items:center;gap:12px;text-align:left;width:100%;padding:18px 10px;font-size:13px;border-bottom:1px solid #bdcfc5;line-height:1.7;cursor:pointer;transition:background .2s,color .2s,padding .2s}nav button:hover{padding-left:15px;background:#dce8e0}nav button>span:first-child{font-family:Georgia,serif;color:#638d7c}nav button[aria-current]{background:#d3e2d8;color:#194e3c}nav button>span:last-child.vpi-arrow-right{margin-left:auto}.source{display:inline-flex;align-items:center;gap:10px;font-size:12px;margin-top:24px;color:#35654f}.guide-note{border-left:3px solid #de9860;padding-left:18px;margin-top:40px}.guide-note strong{font-size:13px}.guide-note p{font-size:12px;color:#62726b;line-height:1.9;margin-top:8px}.stage-heading{display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#5f756c;margin-bottom:16px}.heading-actions{display:flex;align-items:center;gap:14px}.enter-fullscreen{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid #b9cfc4;border-radius:999px;background:#f5f7f1;color:#315f51;font-size:11px;cursor:pointer;transition:transform .16s,background .16s,box-shadow .16s}.enter-fullscreen svg,.exit-fullscreen svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.enter-fullscreen:hover{transform:translateY(-1px);background:#fff;box-shadow:0 5px 14px #28443212}.card-stack{position:relative;perspective:1800px;touch-action:pan-y;min-height:300px;isolation:isolate;transform-style:preserve-3d}.card-stack:before,.card-stack:after{content:'';position:absolute;inset:0;background:#f6f2e4;border:1px solid #d4ceba;border-radius:12px;transform:rotate(1.3deg) translateY(4px);z-index:-2;box-shadow:0 10px 28px #2844320f;transition:transform .45s cubic-bezier(.22,.75,.22,1)}.card-stack:after{transform:rotate(-1deg) translateY(8px);z-index:-1}.card-stack.turning:before{transform:rotate(2deg) translate(8px,8px)}.card-stack.turning:after{transform:rotate(-1.6deg) translate(-5px,11px)}.knowledge-card{position:relative;z-index:2;box-shadow:0 12px 34px #28443218;border-radius:12px;overflow:hidden;transform-origin:left center;backface-visibility:hidden;user-select:none;cursor:grab;will-change:transform,opacity,filter}.card-stack.backward .knowledge-card{transform-origin:right center}.card-stack.dragging .knowledge-card{transform:translateX(var(--drag-x)) rotateY(var(--drag-turn)) rotateZ(calc(var(--drag-turn) * .12));box-shadow:calc(var(--drag-x) * -.08) 18px 42px #2844322b;transition:transform .08s linear,box-shadow .08s linear;cursor:grabbing}.knowledge-card :deep(svg){display:block;width:100%;height:auto}.page-edge{pointer-events:none;position:absolute;z-index:7;top:1.5%;bottom:1.5%;width:5%;right:0;border-radius:0 12px 12px 0;background:linear-gradient(90deg,transparent,#fff8);opacity:0;transform:translateX(30%)}.card-stack.forward.turning .page-edge{animation:edge-sweep .62s cubic-bezier(.55,.05,.25,1)}.card-stack.backward.turning .page-edge{left:0;right:auto;transform:scaleX(-1) translateX(30%);animation:edge-sweep .62s cubic-bezier(.55,.05,.25,1)}.card-controls{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:24px}.card-controls button{display:inline-flex;align-items:center;gap:9px;padding:12px 14px;border:1px solid #bdcfc5;background:#f6f8f3;border-radius:6px;font-size:12px;cursor:pointer;transition:transform .16s,background .16s,box-shadow .16s}.card-controls button:hover:not(:disabled){transform:translateY(-2px);background:#fff;box-shadow:0 5px 14px #28443212}.card-controls button:active:not(:disabled){transform:translateY(0) scale(.97)}.card-controls button:disabled{opacity:.5;cursor:default}.card-counter{display:flex;align-items:center;gap:9px;font-size:12px;color:#52675f;font-variant-numeric:tabular-nums}.card-counter i,.fullscreen-counter i{width:5px;height:5px;border-radius:50%;background:#8eaa9d;transition:transform .25s,background .25s}.card-counter i.active,.fullscreen-counter i.active{background:#de9860;transform:scale(1.7)}.card-status{text-align:center;font-size:11px;color:#597066;min-height:20px;margin-top:12px}.forward-enter-active,.backward-enter-active{z-index:2;transition:transform .62s cubic-bezier(.16,.78,.25,1),opacity .42s ease-out,filter .52s ease-out}.forward-leave-active,.backward-leave-active{position:absolute;inset:0;z-index:5;transition:transform .48s cubic-bezier(.55,.05,.35,1),opacity .34s ease-in,filter .42s ease-in,box-shadow .42s ease-in}.forward-leave-to{transform:translateX(-5%) rotateY(-76deg) rotateZ(-1deg);opacity:.08;filter:saturate(.75) brightness(.94);box-shadow:24px 16px 48px #162b382e}.forward-enter-from{transform:translateX(4%) rotateY(5deg) scale(.975);opacity:.72;filter:saturate(.82) brightness(.97)}.backward-leave-to{transform:translateX(5%) rotateY(76deg) rotateZ(1deg);opacity:.08;filter:saturate(.75) brightness(.94);box-shadow:-24px 16px 48px #162b382e}.backward-enter-from{transform:translateX(-4%) rotateY(-5deg) scale(.975);opacity:.72;filter:saturate(.82) brightness(.97)}@keyframes edge-sweep{0%{opacity:0;transform:translateX(30%)}28%{opacity:.75}75%{opacity:.26}100%{opacity:0;transform:translateX(-1350%)}}button:focus-visible,a:focus-visible,.card-stack:focus-visible{outline:3px solid #bb824c;outline-offset:5px}:global(html.sketch-fullscreen){overflow:hidden}.fullscreen-reader{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(circle at 50% 42%,#35665a 0,#244d45 42%,#173a35 100%);overflow:hidden}.fullscreen-reader:before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.22;background-image:linear-gradient(115deg,transparent 45%,#fff2 50%,transparent 55%),radial-gradient(#f5e9c8 1px,transparent 1px);background-size:100% 100%,26px 26px}.fullscreen-reader .stage-heading,.fullscreen-reader .card-controls,.fullscreen-reader .card-status{display:none}.fullscreen-reader .card-stack{width:min(calc(100vw - 168px),calc((100dvh - 56px)*.768));min-height:0;aspect-ratio:860/1120;touch-action:none}.fullscreen-reader .knowledge-card{height:100%;box-shadow:0 24px 70px #081d1a70}.fullscreen-reader .knowledge-card :deep(svg){height:100%;width:100%}.exit-fullscreen,.page-hotspot{position:absolute;z-index:20;display:grid;place-items:center;border:1px solid #e7f2e744;background:#eef7ee18;color:#f6f2e4;cursor:pointer;backdrop-filter:blur(10px);transition:background .18s,transform .18s,opacity .18s}.exit-fullscreen{top:22px;right:24px;width:42px;height:42px;border-radius:50%}.exit-fullscreen:hover,.page-hotspot:hover:not(:disabled){background:#f8f2df2e;transform:scale(1.05)}.page-hotspot{top:50%;width:58px;height:112px;margin-top:-56px;border-radius:40px;font-size:20px}.page-hotspot.previous{left:20px}.page-hotspot.next{right:20px}.page-hotspot:disabled{opacity:.35;cursor:default}.fullscreen-counter{position:absolute;z-index:20;left:50%;bottom:17px;display:flex;align-items:center;gap:9px;transform:translateX(-50%);padding:7px 12px;border:1px solid #e7f2e733;border-radius:999px;background:#102e2a88;color:#f5f0df;font-size:11px;font-variant-numeric:tabular-nums;backdrop-filter:blur(10px)}
@media(min-width:1400px){.sketch-layout{grid-template-columns:350px minmax(0,640px);gap:96px}}
@media(max-width:850px){.sketch-room{padding:24px 20px 36px}.sketch-layout{grid-template-columns:1fr;gap:28px;max-width:620px}.book-guide{position:static;padding:0}.book-guide h1{font-size:28px;margin:12px 0}.book-guide h1 br{display:none}.description{font-size:13px}.description br{display:none}.sample-label{margin-top:16px}nav button{padding:10px;font-size:12px}.guide-note{display:none}.source{margin-top:14px}.card-controls button{padding:10px;font-size:11px;gap:5px}.card-status{font-size:10px}.stage-heading{margin-bottom:12px}.heading-actions{gap:9px}.enter-fullscreen span{display:none}.fullscreen-reader{padding:16px}.fullscreen-reader .card-stack{width:min(calc(100vw - 32px),calc((100dvh - 88px)*.768))}.exit-fullscreen{top:12px;right:12px}.page-hotspot{width:44px;height:84px;margin-top:-42px;background:#102e2a44;border-color:#e7f2e722}.page-hotspot.previous{left:5px}.page-hotspot.next{right:5px}.fullscreen-counter{bottom:11px}}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}.page-edge{display:none}.card-stack.dragging .knowledge-card{transform:none}}
</style>
<style scoped>
.reading-options{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px}.login-note{margin:0;text-align:right;font-size:12px;line-height:1.7;color:#60776d}.login-note span{display:block;font-size:11px;color:#78877e}.fullscreen-reader .reading-options{display:none}@media(max-width:600px){.reading-options{gap:8px}.login-note{font-size:11px}.login-note span{font-size:10px}}
</style>
<style scoped>
.mobile-card{display:none}.desktop-card{height:100%}.chapter-label{display:block;font-size:13px;margin:0 0 8px;color:#426858}.chapter-select{width:100%;min-height:46px;padding:10px 12px;background:#fffdf5;border:1px solid #b9cfc4;border-radius:8px;font:inherit;font-size:14px;color:#253d4b}.chapter-directory{margin-top:18px}.chapter-directory summary{cursor:pointer;font-size:13px;margin-bottom:12px;color:#52675f}.chapter-directory nav{max-height:38vh;overflow:auto}.course-contact{display:block;margin-top:12px}.fullscreen-reader .desktop-card{height:100%}.fullscreen-reader .card-stack{width:min(calc(100vw - 168px),calc((100dvh - 100px)*.768))}.fullscreen-counter{bottom:max(14px,env(safe-area-inset-bottom))}.exit-fullscreen{top:max(14px,env(safe-area-inset-top));right:max(14px,env(safe-area-inset-right));width:44px;height:44px}.enter-fullscreen{min-height:44px;min-width:44px;justify-content:center}.chapter-select:focus-visible{outline:3px solid #bb824c;outline-offset:3px}
@media(max-width:600px){.desktop-card{display:none}.mobile-card{display:block;height:100%}.sketch-room{padding:20px 14px 32px}.sketch-layout{gap:24px}.book-guide h1{font-size:27px}.description{font-size:14px}.description br{display:block}.sample-label{font-size:13px}.chapter-directory nav{max-height:155px}.chapter-directory nav button{font-size:14px;min-height:44px}.source{font-size:13px}.guide-note{display:none}.stage-heading{gap:8px;font-size:12px}.heading-actions{gap:8px;flex-shrink:0}.card-controls button{min-height:44px;font-size:14px}.card-status{font-size:12px}.fullscreen-reader{padding:calc(60px + env(safe-area-inset-top)) 12px calc(76px + env(safe-area-inset-bottom));height:100dvh;box-sizing:border-box}.fullscreen-reader .card-stack{width:min(calc(100vw - 24px),calc((100dvh - 136px - env(safe-area-inset-top) - env(safe-area-inset-bottom)) * .612245));aspect-ratio:600/980}.fullscreen-reader .knowledge-card{height:100%}.fullscreen-reader .page-hotspot{top:auto;bottom:max(16px,env(safe-area-inset-bottom));margin:0;width:56px;height:48px;border-radius:24px;background:#ffffff18}.fullscreen-reader .page-hotspot.previous{left:calc(50% - 114px)}.fullscreen-reader .page-hotspot.next{right:calc(50% - 114px)}.fullscreen-reader .fullscreen-counter{bottom:calc(max(16px,env(safe-area-inset-bottom)) + 8px);font-size:13px}.fullscreen-reader .card-stack:focus-visible{outline:none}}
@media(max-height:500px) and (min-width:601px){.fullscreen-reader .card-stack{width:calc((100dvh - 70px)*.768)}.fullscreen-counter{bottom:5px}}
.card-stage:not(.fullscreen-reader){width:100%;max-width:440px;justify-self:center}
.card-stage:not(.fullscreen-reader) .card-stack{width:min(100%,max(280px,calc((100dvh - 320px)*.768)));margin-inline:auto;min-height:0}
.card-stage:not(.fullscreen-reader) .card-controls{margin-top:20px}
@media(min-width:851px){.sketch-layout{max-width:1040px;grid-template-columns:300px minmax(0,1fr);gap:64px}.book-guide{padding-top:8px}.book-guide h1{font-size:30px;margin:16px 0 12px}.guide-note{margin-top:24px}.chapter-directory nav{max-height:26vh}}
@media(max-width:600px){.card-stage:not(.fullscreen-reader){max-width:380px}.card-stage:not(.fullscreen-reader) .card-stack{width:min(100%,300px)}}
</style>
