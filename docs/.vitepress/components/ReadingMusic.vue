<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { apiUrl } from '../lib/session.js'

/**
 * 曲子在 R2 桶里，走 /api/files 代取 —— 7MB 的音频不进仓库。
 * 用 apiUrl 而不是拼固定路径：站点同时挂在根路径和 coderfather.com/ai/ 下，
 * 前缀要跟着运行时的 site.base 走。
 */
const AUDIO_KEY = 'public/audio/mapplezs-pugongying-deyueding-piano.mp3'

const playing=ref(false), starting=ref(false), message=ref('点击开启轻音乐')
let audio, disposed=false, preference='on'
function remember(value){try{localStorage.setItem('reading-music',value)}catch{}}
async function start(){
  if(disposed||playing.value||starting.value)return
  starting.value=true
  try{
    await audio.play()
    if(disposed||preference==='off'||document.hidden){audio.pause();return}
    playing.value=!audio.paused
    message.value='正在播放《蒲公英的约定》钢琴曲'
  }catch{message.value='点击重试播放轻音乐'}finally{starting.value=false}
}
function stop(){
  audio?.pause()
  playing.value=false;message.value='轻音乐已关闭'
}
function toggle(){
  preference=playing.value?'off':'on';remember(preference)
  if(preference==='off')void stop();else void start()
}
function firstInteraction(event){
  if(event.target?.closest?.('.reading-music'))return
  if(preference==='on')void start()
  document.removeEventListener('pointerdown',firstInteraction)
  document.removeEventListener('keydown',firstInteraction)
}
function visibility(){
  if(document.hidden){void stop()}
  else if(preference==='on'){message.value='点击继续轻音乐';document.addEventListener('pointerdown',firstInteraction);document.addEventListener('keydown',firstInteraction)}
}
onMounted(()=>{
  audio=new Audio(apiUrl('/files?path='+encodeURIComponent(AUDIO_KEY)))
  audio.loop=true;audio.volume=.2;audio.preload='none'
  audio.onpause=()=>{playing.value=false}
  audio.onerror=()=>{playing.value=false;starting.value=false;message.value='音乐加载失败，点击重试'}
  try{preference=localStorage.getItem('reading-music')||'on'}catch{}
  if(preference==='off')message.value='轻音乐已关闭'
  document.addEventListener('pointerdown',firstInteraction)
  document.addEventListener('keydown',firstInteraction)
  document.addEventListener('visibilitychange',visibility)
})
onBeforeUnmount(()=>{
  disposed=true
  document.removeEventListener('pointerdown',firstInteraction)
  document.removeEventListener('keydown',firstInteraction)
  document.removeEventListener('visibilitychange',visibility)
  audio?.pause()
  if(audio){audio.onpause=null;audio.onerror=null;audio.removeAttribute('src');audio.load()}
})
</script>

<template>
  <div class="reading-music">
    <button type="button" :title="message" :disabled="starting" :aria-pressed="playing" :aria-label="playing?'关闭轻音乐':'开启轻音乐'" @click="toggle">
      <span class="sound-bars" :class="{playing}" aria-hidden="true"><i/><i/><i/></span>
      <span>轻音乐</span>
    </button>
    <span class="music-hint" role="status">{{message}}</span>
  </div>
</template>

<style scoped>
.reading-music{display:flex;align-items:center;gap:12px;margin-bottom:14px;color:#426858;font-size:12px}.reading-music button{display:flex;align-items:center;gap:9px;min-height:44px;padding:8px 14px;border:1px solid #b9cfc4;border-radius:24px;background:#fffdf5;cursor:pointer;font:inherit}.reading-music button:focus-visible{outline:3px solid #bb824c;outline-offset:3px}.sound-bars{display:flex;align-items:center;gap:3px;height:18px}.sound-bars i{height:6px;width:3px;border-radius:3px;background:currentColor}.sound-bars.playing i{animation:music-pulse 1.3s ease-in-out infinite}.sound-bars i:nth-child(2){animation-delay:-.4s}.sound-bars i:nth-child(3){animation-delay:-.8s}@keyframes music-pulse{50%{height:17px}}@media(prefers-reduced-motion:reduce){.sound-bars.playing i{animation:none;height:12px}}
.reading-music{margin:0}.reading-music button{border-color:transparent;background:transparent;padding:8px;color:#60776d}.reading-music button:hover,.reading-music button[aria-pressed=true]{color:#21664e;background:#dce8e0}.music-hint{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}:global(.fullscreen-reader) .reading-music{display:none}
</style>
