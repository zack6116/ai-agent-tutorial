import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createMarkdownRenderer} from 'vitepress';
import {chromium} from '/Users/zack/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {pages} from './manifest.mjs';
import {library} from '../../docs/.vitepress/data/reference-library.mjs';

const root=process.cwd();
const out='draft_ea4045db_folder';
fs.mkdirSync('docs/public/agent-diagrams',{recursive:true});
const server=http.createServer((req,res)=>{
 const requested=decodeURIComponent(req.url.split('?')[0]);
 if(requested==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta charset="utf-8"></head><body><main id="diagram"></main></body></html>');return;}
 const file=path.resolve(root,'.'+requested);
 if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',file.endsWith('.mjs')||file.endsWith('.js')?'text/javascript':file.endsWith('.png')?'image/png':'text/plain');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:2});
await page.goto(`http://127.0.0.1:${server.address().port}/`);
await page.evaluate(async()=>{
 window.mermaid=(await import('/node_modules/mermaid/dist/mermaid.esm.min.mjs')).default;
 window.mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'base',fontFamily:'PingFang SC, sans-serif',themeVariables:{primaryColor:'#eef6ee',primaryBorderColor:'#8ca78d',primaryTextColor:'#263529',secondaryColor:'#f7e9ee',tertiaryColor:'#fdf5df',lineColor:'#617468',fontSize:'18px'},flowchart:{htmlLabels:false,curve:'linear',padding:18}});
});
// Re-render the comparison as two adjacent panels; disjoint Mermaid subgraphs
// otherwise stack vertically and make this teaching comparison unreadable.
await page.evaluate(()=>{
 const box=document.getElementById('diagram');
 box.style.cssText='background:white;width:1120px;padding:35px;box-sizing:border-box;font-family:PingFang SC,sans-serif';
 box.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1.7fr;gap:35px;color:#343c35;text-align:center;font-size:24px;line-height:1.5">
 <section style="background:#fffde9;border:1px solid #d8d2a2;padding:24px"><b>普通 AI</b><div style="margin-top:26px;background:#f7dce7;padding:20px">用户指令</div>↓<div style="background:#f7dce7;padding:20px">执行单一操作</div>↓<div style="background:#f7dce7;padding:20px">直接输出结果</div>↓<div style="background:#f7dce7;padding:20px;border-radius:40px">结束</div></section>
 <section style="background:#fffde9;border:1px solid #d8d2a2;padding:24px"><b>AI Agent</b><div style="margin-top:26px;background:#e5efdb;padding:15px">用户目标 → 分解任务目标</div>↓<div style="background:#e5efdb;padding:15px">自主规划路径</div>↓<div style="background:#e5efdb;padding:15px">执行多步操作（搜索／分析／验证）</div>↓<div style="background:#e5efdb;padding:15px">目标达成？</div><div style="display:flex;justify-content:space-around;margin-top:20px"><span>否 ↗ 重新规划</span><span>是 ↓ 完成</span></div></section></div>`;
});
await page.locator('#diagram').screenshot({path:'docs/public/agent-diagrams/01-understand-1.png'});
let diagramCount=0;
for(const p of pages){
 const file=`docs/replica/${p.slug}.md`;
 let md=fs.readFileSync(file,'utf8');
 const matches=[...md.matchAll(/```mermaid\n([\s\S]*?)```/g)];
 for(let i=0;i<matches.length;i++){
  const name=`${p.slug}-${i+1}`;
  const code=matches[i][1];
  fs.writeFileSync(`docs/public/agent-diagrams/${name}.mmd`,code);
  await page.evaluate(async({code,name})=>{
   const {svg}=await window.mermaid.render(`diagram-${name}`,code);
   const container=document.getElementById('diagram');container.innerHTML=svg;
   container.style.cssText='background:white;padding:24px;width:1120px;box-sizing:border-box';
   const el=container.querySelector('svg');el.style.width='100%';el.style.height='auto';el.style.maxWidth='100%';
  },{code,name});
  await page.locator('#diagram').screenshot({path:`docs/public/agent-diagrams/${name}.png`});
  md=md.replace(matches[i][0],`![${p.title}：流程与结构图 ${i+1}](/agent-diagrams/${name}.png)`);
  diagramCount++;
 }
 if(matches.length)fs.writeFileSync(file,md);
}
const markdown=await createMarkdownRenderer(root,{html:true});
markdown.renderer.rules.fence=(tokens,i)=>`<pre data-language="${tokens[i].info.trim()}"><code>${markdown.utils.escapeHtml(tokens[i].content)}</code></pre>`;
const slugs=['index',...pages.map(p=>p.slug),'16-atlas'];
const stats=[];
for(const slug of slugs){
 let md=fs.readFileSync(`docs/replica/${slug}.md`,'utf8');
 md=md.replace(/<ReferenceLibrary kind="(\w+)"\s*\/>/g,(_,kind)=>`<div data-gallery="${kind}"></div>`);
 const html=markdown.render(md);
 const xml=await page.evaluate(({html,library})=>{
  const dom=new DOMParser().parseFromString(html,'text/html');
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const inline=el=>[...el.childNodes].map(walk).join('');
  const img=src=>`<img path="@./docs/public${esc(decodeURIComponent(src))}"/>`;
  let heading=0;
  function walk(el){
   if(el.nodeType===3)return esc(el.textContent);
   if(el.nodeType!==1)return '';
   const t=el.tagName.toLowerCase();
   if(el.classList.contains('header-anchor'))return '';
   if(t==='div'&&el.dataset.gallery){
    const cards=library[el.dataset.gallery];let grids='';
    for(let i=0;i<cards.length;i+=2)grids+='<grid>'+cards.slice(i,i+2).map(c=>`<column width-ratio="0.5"><callout background-color="light-blue"><p><b>${esc(c.cover).replaceAll('\n','<br/>')}</b></p></callout><p><b>${esc(c.title)}</b></p><p>${esc(c.author)}</p><p>${esc(c.description)}</p>${c.url?`<p><a href="${esc(c.url)}">查看资料</a></p>`:''}${c.note?`<p>${esc(c.note)}</p>`:''}<p><span background-color="light-green">${esc(c.tag)}</span> ${esc(c.date||'')}</p></column>`).join('')+'</grid>';
    let cardIndex=0;
    return grids.replace(/<p><span background-color="light-green">/g, () => {
     const rating=cards[cardIndex++].rating;
     return `${rating?`<p><span text-color="orange">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</span> 原图评分</p>`:''}<p><span background-color="light-green">`;
    });
   }
   if(t==='div'&&el.classList.contains('custom-block')){
    const color=el.classList.contains('tip')?'green':el.classList.contains('warning')?'orange':el.classList.contains('danger')?'red':'gray';
    return `<callout background-color="light-${color}">${inline(el)}</callout>`;
   }
   if(t==='h1')return `<title>${esc(el.textContent.replaceAll('#','').trim())}</title>`;
   if(/^h[2-6]$/.test(t)){
    const level=Number(t[1])-1; const color=heading++%2?'orange':'green';
    return `<h${level}>${level===1?`<span background-color="light-${color}" text-color="${color}">${inline(el)}</span>`:inline(el)}</h${level}>`;
   }
   if(t==='pre')return `<pre lang="${esc(el.dataset.language||'text')}"><code>${esc(el.textContent).replaceAll('&quot;','"')}</code></pre>`;
   if(t==='img')return img(el.getAttribute('src'));
   if(t==='p'&&el.querySelector('img'))return [...el.querySelectorAll('img')].map(e=>img(e.getAttribute('src'))).join('');
   if(t==='strong')return `<b>${inline(el)}</b>`;
   if(t==='a')return `<a href="${esc(el.getAttribute('href')||'')}">${inline(el)}</a>`;
   if(t==='hr'||t==='br')return `<${t}/>`;
   if(t==='summary')return `<p><b>${inline(el)}</b></p>`;
   if(['p','em','code','blockquote','ul','ol','li','table','thead','tbody','tr','td','th'].includes(t)){
    const content=inline(el);return `<${t}>${t==='td'||t==='th'?`<p>${content}</p>`:content}</${t}>`;
   }
   return inline(el);
  }
  return [...dom.body.childNodes].map(walk).join('');
 },{html,library});
 fs.writeFileSync(`${out}/${slug}.xml`,xml);
 stats.push({slug,characters:md.length,images:(xml.match(/<img /g)||[]).length,callouts:(xml.match(/<callout /g)||[]).length,grids:(xml.match(/<grid>/g)||[]).length});
}
fs.copyFileSync(`${out}/01-understand.xml`,`${out}/draft.xml`);
fs.writeFileSync(`${out}/render-report.json`,JSON.stringify({diagramCount,pages:stats},null,2));
await browser.close();server.close();
console.log(JSON.stringify({diagramCount,pages:stats},null,2));
