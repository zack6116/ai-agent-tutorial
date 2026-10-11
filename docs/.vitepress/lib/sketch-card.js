const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))
function lines(text, max) {
  const result=[]; let line='', width=0
  for (const char of String(text)) { const w = /[\x00-\xff]/.test(char) ? .56 : 1; if(width+w>max){result.push(line);line='';width=0} line+=char;width+=w }
  if(line)result.push(line); return result
}
function text(value,x,y,size=24,color='#253d4b',max=30,weight=400) {
 return `<text x="${x}" y="${y}" fill="${color}" font-family="'Kaiti SC','STKaiti','KaiTi','PingFang SC',sans-serif" font-size="${size}" font-weight="${weight}">${lines(value,max).map((line,i)=>`<tspan x="${x}" dy="${i?size*1.55:0}">${escape(line)}</tspan>`).join('')}</text>`
}
function box(x,y,w,h,fill) {return `<path d="M${x+6} ${y+2} Q${x+w/2} ${y-4} ${x+w-4} ${y+3} L${x+w+2} ${y+h-5} Q${x+w/2} ${y+h+5} ${x+2} ${y+h-1} Z" fill="${fill}" stroke="#253d4b" stroke-width="2.3" stroke-linejoin="round"/><path d="M${x+2} ${y+6} L${x+w-1} ${y+1} L${x+w-2} ${y+h+3}" fill="none" stroke="#253d4b" stroke-opacity=".22" stroke-width="1.2"/>`}
function arrow(x,y,w){return `<path d="M${x} ${y} Q${x+w/2} ${y-10} ${x+w} ${y-1} m-12 -8 l12 8 -13 8" fill="none" stroke="#253d4b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`}
function diagram(card) {
 const colors=['#c4e4d5','#ffd59d','#d4cef0']; const labels=card.nodes
 if(card.id==='01-02') return `${box(275,288,310,76,colors[1])}${text('这个任务怎么做？',308,335,26)}<path d="M430 367 L430 390 M170 390 L690 390 M170 390 L170 422 M430 390 L430 422 M690 390 L690 422" fill="none" stroke="#253d4b" stroke-width="2.5"/>${['规则明确','步骤固定','动态决策'].map((n,i)=>`${box(65+i*260,426,210,74,colors[i])}${text(n,111+i*260,472,24)}`).join('')}${['普通程序','工作流','Agent'].map((n,i)=>text(n,119+i*260,539,22,'#536776')).join('')}`
 return `${labels.map((n,i)=>`${box(66+i*264,322,200,132,colors[i])}${text('0'+(i+1),88+i*264,353,17,'#52636b')}${text(n,95+i*264,412,26)}`).join('')}${arrow(273,387,45)}${arrow(537,387,45)}${card.id==='01-01'?`<path d="M694 465 Q690 520 440 514 Q172 520 164 465 m-8 10 l8 -10 9 10" stroke="#277b65" stroke-width="2.5" stroke-dasharray="7 5" fill="none"/>${text('还没完成？带着反馈，继续下一步。',230,547,22,'#277b65')}`:text('每一步都能单独检查，错误才容易找到。',177,520,24,'#277b65')}`
}
function desktopCard(card,chapter,index,total) {
 const notes=card.notes.map((n,i)=>`${box(65,620+i*94,38,37,['#c4e4d5','#ffd59d','#d4cef0'][i])}${text(i+1,76,646+i*94,20)}${text(n,124,646+i*94,23,'#253d4b',29)}`).join('')
 return `<svg xmlns="http://www.w3.org/2000/svg" width="860" height="1120" viewBox="0 0 860 1120" role="img" aria-label="${escape(card.title)}"><rect width="860" height="1120" rx="14" fill="#fffdf5"/><path d="M35 36 Q420 30 825 38 L820 1082 Q420 1090 38 1080 Z" fill="none" stroke="#d6cdbb" stroke-width="1.5"/><g fill="#ddd4c1" opacity=".55">${Array.from({length:18},(_,i)=>`<circle cx="${55+i*43}" cy="1080" r="1.3"/>`).join('')}</g><path d="M55 82 L371 77" stroke="#ffd59d" stroke-width="23" opacity=".8"/>${text('AI 实战手绘本 / '+chapter,62,89,19)}${text('NO. '+card.id,665,89,18)}${text(card.title,65,162,35,'#1e3a49',22,600)}${text(card.idea,65,213,23,'#52636b',31)}${diagram(card)}<path d="M65 582 Q430 588 790 579" fill="none" stroke="#b5c8c1" stroke-width="2"/>${notes}${box(63,925,729,102,'#eef3e6')}${text('动手想一想',83,955,18,'#277b65',40,600)}${text(card.practice,83,990,21,'#253d4b',32)}${text('第一章 · 知识点导读｜完整讲解与代码见原教程',65,1060,16,'#6c7d80',48)}${text(`${index+1} / ${total}`,714,1060,16,'#6c7d80')}</svg>`
}
export function renderCard(card,chapter,index,total) {
 return desktopCard(card,chapter,index,total)
  .replace('第一章 · 知识点导读｜完整讲解与代码见原教程','知识图解与练习｜完整讲解与代码见本章教程')
  .replace('每一步都能单独检查，错误才容易找到。','把概念连起来，再用下面的练习验证。')
}

export function renderMobileCard(card,chapter,index,total) {
 const colors=['#c4e4d5','#ffd59d','#d4cef0']
 const notes=card.notes.map((n,i)=>`${box(30,432+i*108,32,34,colors[i])}${text(i+1,39,457+i*108,21)}${text(n,78,457+i*108,28,'#253d4b',17)}`).join('')
 return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="980" viewBox="0 0 600 980" role="img" aria-label="${escape(card.title)}"><rect width="600" height="980" rx="16" fill="#fffdf5"/><path d="M18 20 Q300 16 582 22 L580 960 Q300 966 20 958 Z" fill="none" stroke="#d6cdbb" stroke-width="1.5"/><path d="M32 53 L320 50" stroke="#ffd59d" stroke-width="22" opacity=".8"/>${text(chapter,34,60,23)}${text(card.title,30,122,34,'#1e3a49',16,600)}${text(card.idea,30,199,27,'#52636b',20)}${card.nodes.map((n,i)=>`${box(30+i*186,306,166,78,colors[i])}${text(n,43+i*186,352,24,'#253d4b',6)}`).join('')}${arrow(198,345,15)}${arrow(384,345,15)}<path d="M30 410 Q300 416 566 410" fill="none" stroke="#b5c8c1" stroke-width="2"/>${notes}${box(29,791,542,137,'#eef3e6')}${text('动手想一想',47,824,23,'#277b65',20,600)}${text(card.practice,47,865,27,'#253d4b',18)}${text(`${index+1} / ${total}`,487,950,20,'#6c7d80')}</svg>`
}
