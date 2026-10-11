import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {pages, sourceRoot} from './manifest.mjs';
import {library} from '../../docs/.vitepress/data/reference-library.mjs';

const folder='draft_ea4045db_folder';
const state=JSON.parse(fs.readFileSync(`${folder}/sync-state.json`));
const compact=s=>s.replace(/<[^>]+>/g,'').replace(/&(?:amp|lt|gt|quot|apos);/g,m=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"}[m])).replace(/[\s\u200b-\u200f\u202a-\u202e\ufeff]/g,'');
const hash=b=>createHash('sha256').update(b).digest('hex');
const results=[];
for(const p of [...pages,{slug:'16-atlas'}]) {
 const xml=fs.readFileSync(`${folder}/upload-${p.slug}.xml`,'utf8');
 const remote=JSON.parse(fs.readFileSync(`${folder}/remote-${p.slug}.json`)).document.content;
 const textMatches=compact(xml)===compact(remote);
 const images=(xml.match(/<img /g)||[]).length;
 const imageMatches=images===(remote.match(/<img /g)||[]).length;
 const links=[...xml.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
 const linksMatch=links.every(href=>remote.includes(`href="${href}"`));
 const response=await fetch(`http://127.0.0.1:4177/replica/${p.slug}.html`);
 const html=await response.text();
 const assets=[...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m=>m[1]).filter(s=>s.startsWith('/'));
 const assetChecks=await Promise.all(assets.map(async a=>({path:a,status:(await fetch(`http://127.0.0.1:4177${a}`)).status})));
 const rawMarkup=remote.includes(':::')||remote.includes('```mermaid');
 const localLinks=links.filter(s=>s.startsWith('/')||s.startsWith('./'));
 results.push({slug:p.slug,textMatches,imageMatches,images,linksMatch,pageStatus:response.status,assetChecks,rawMarkup,localLinks,remoteUrl:`https://my.feishu.cn/wiki/${state.pages[p.slug].node_token}`});
}
const originalFiles=fs.readdirSync(sourceRoot).filter(s=>/\.(webp|png|md)$/.test(s)).map(name=>({name,unchanged:hash(fs.readFileSync(`${sourceRoot}/${name}`))===hash(fs.readFileSync(`docs/public/reference-agent/${name}`))}));
const scenarios=(fs.readFileSync('docs/replica/19-scenarios.md','utf8').match(/^\| \d+ \|/gm)||[]).length;
const passed=results.every(p=>p.textMatches&&p.imageMatches&&p.linksMatch&&p.pageStatus===200&&p.assetChecks.every(a=>a.status===200)&&!p.rawMarkup&&!p.localLinks.length)&&originalFiles.every(p=>p.unchanged)&&scenarios===50;
const report={passed,checkedAt:new Date().toISOString(),pages:results,originalFiles,resourceCards:Object.fromEntries(Object.entries(library).map(([k,v])=>[k,v.length])),scenarios};
fs.writeFileSync(`${folder}/audit-report.json`,JSON.stringify(report,null,2));
fs.writeFileSync('scripts/replica/coverage.json',JSON.stringify({sourceRoot,pages:pages.map(p=>({...p,status:passed?'synced-and-verified':'verification-failed',verified:results.find(r=>r.slug===p.slug)?.textMatches===true})),evidence:`${folder}/audit-report.json`,scopeAndVisualReview:'scripts/replica/ACCEPTANCE.md',pending:passed?[]:['检查 audit-report.json 中失败项']},null,2));
console.log(JSON.stringify({passed,pages:results.map(({slug,textMatches,imageMatches,linksMatch,pageStatus,rawMarkup,localLinks})=>({slug,textMatches,imageMatches,linksMatch,pageStatus,rawMarkup,localLinks})),originalFiles:originalFiles.length,scenarios},null,2));
if(!passed)process.exitCode=1;
