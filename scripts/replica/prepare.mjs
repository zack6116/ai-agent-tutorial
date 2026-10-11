import fs from 'node:fs';
import path from 'node:path';
import {pages,sourceRoot} from './manifest.mjs';
const target='docs/public/reference-agent';
fs.mkdirSync(target,{recursive:true});
for(const name of fs.readdirSync(sourceRoot).filter(n=>/\.(webp|png|md)$/.test(n))) fs.copyFileSync(path.join(sourceRoot,name),path.join(target,name));
for(const p of pages){
 const file=`docs/replica/${p.slug}.md`;
 const clean=fs.readFileSync(file,'utf8').split('<!-- source-reference -->')[0].trimEnd().replace(/(\*\*[^*\n]+\*\*)(?=[\p{L}\p{N}])/gu,'$1 ');
 if(!p.source){fs.writeFileSync(file,`${clean}\n\n<!-- source-reference -->\n\n<div class="source-note">本页依据参考图侧栏中的主题名称补写，原图没有展示该页正文。讲解顺序、案例和验证方法与复刻页面保持一致。</div>\n`);continue;}
 const name=`${String(p.source).padStart(2,'0')}-原图-配图.webp`;
 fs.writeFileSync(file,`${clean}\n\n<!-- source-reference -->\n\n<div class="source-note">内容依据：用户提供的第 ${p.source} 张参考图。保留其可见结构、概念和案例，截图未显示的步骤为教学补写。原图作者与历史标注见下方对照。</div>\n\n<details><summary>查看参考原图 · 完整保留截图中的图表与可见文字</summary>\n\n![第${p.source}张参考原图](/reference-agent/${name})\n\n</details>\n`);
}
const groups=[...new Set(pages.map(p=>p.group))].sort((a,b)=>parseInt(a)-parseInt(b));
const index=`# AI Agent 搭建知识库\n\n从原理到案例，从工作流到真实应用。按照参考图的目录结构阅读，也可以直接选择一个项目动手。\n\n::: tip 第一次来，从这条路线开始\n理解 Agent → 构建第一个助手 → Coze 工作流 → 应用界面 → 客服或 SQL 案例 → 架构与评测。每页同时提供完整参考原图，方便逐项对照。\n:::\n\n${groups.map(g=>`## ${g}\n\n${pages.filter(p=>p.group===g).map(p=>`- [${p.title}](./${p.slug})`).join('\n')}`).join('\n\n')}\n\n## 配套全景图与资料说明\n\n- [工业级全栈架构与五大经典设计模式](./16-atlas)\n- [工程补充：原九章学习路线](/guide/02-roadmap)\n- [手绘知识卡](/courses/ai-agent)\n\n## 复刻范围\n\n参考目录共有 16 张截图（含封面）、2 张配套图和一份笔记。15 张正文截图在本知识库逐页对应；可见的例子、架构、流程、资源卡片均保留。原图没有展示的章节下半部分采用同样的讲解顺序补写，不能将补写当作原作者未公开的全文。\n\n资料来源：老A的AI研究所的截图笔记；截图中的飞书作者标注为 Jack。原图中“已交付”“降低42%”等描述属于参考案例，不作为本项目业绩。\n`;
fs.writeFileSync('docs/replica/index.md',index);
fs.writeFileSync('docs/.vitepress/data/replica-sidebar.json',JSON.stringify(groups.map(text=>({text,collapsed:false,items:pages.filter(p=>p.group===text).map(p=>({text:p.title,link:`/replica/${p.slug}`}))})),null,2));
fs.writeFileSync('scripts/replica/coverage.json',JSON.stringify({sourceRoot,pages:pages.map(p=>({...p,status:'drafted',verified:false})),pending:['原图可见内容逐项复核','网页桌面和移动端视觉验收','飞书原生排版与图片上传','所有远端文档回读检查','参考侧栏仅有名称的延伸主题补齐']},null,2));
console.log(`Prepared ${pages.length} source-mapped pages and 19 original files.`);
