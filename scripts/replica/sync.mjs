import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {pages} from './manifest.mjs';
const dir='draft_ea4045db_folder';
const stateFile=`${dir}/sync-state.json`;
const state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):{groups:{},pages:{'01-understand':{node_token:'Kh5pwAqrAilxD4k9a2Hcdx83njg',obj_token:'CsendQU25omgfHxzC62cRC2DnMf'}}};
const save=()=>fs.writeFileSync(stateFile,JSON.stringify(state,null,2));
function cli(args){
 const p=spawnSync('/Users/zack/.local/bin/lark-cli',[...args,'--as','user'],{encoding:'utf8',maxBuffer:15*1024*1024,env:{...process.env,LARKSUITE_CLI_NO_UPDATE_NOTIFIER:'1',LARKSUITE_CLI_NO_SKILLS_NOTIFIER:'1'}});
 let json;try{json=JSON.parse(p.stdout||p.stderr);}catch{throw new Error(`Non-JSON CLI result ${p.status}: ${(p.stdout+p.stderr).slice(0,500)}`)}
 if(p.status!==0||json.ok!==true)throw new Error(JSON.stringify(json.error||json));
 return json.data;
}
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
if(!state.root){state.root=cli(['wiki','+node-create','--parent-node-token','Avarwm4uNiW4oFkywSMc33hvn1b','--title','AI Agent 搭建知识库｜参考图复刻']);save();console.log('Created root',state.root.node_token);}
for(const group of [...new Set(pages.map(p=>p.group))].sort((a,b)=>parseInt(a)-parseInt(b))){
 if(!state.groups[group]){state.groups[group]=cli(['wiki','+node-create','--parent-node-token',state.root.node_token,'--title',group]);save();console.log('Created group',group);}
}
const all=[...pages,{slug:'16-atlas',title:'工业级全栈架构与五大经典设计模式'}];
for(const p of all){
 if(!state.pages[p.slug]){state.pages[p.slug]=cli(['wiki','+node-create','--parent-node-token',p.group?state.groups[p.group].node_token:state.root.node_token,'--title',p.title]);save();console.log('Created page',p.slug);}
}
if(!state.introShortcut){state.introShortcut=cli(['wiki','+node-create','--parent-node-token',state.groups[pages[0].group].node_token,'--node-type','shortcut','--origin-node-token',state.pages['01-understand'].node_token,'--title',pages[0].title]);save();}
function rewriteLinks(xml){
 return xml.replace(/href="(?:\.\/|\/replica\/)([a-z\d-]+)(?:\.html)?(?:#[^"]*)?"/g,(m,slug)=>state.pages[slug]?`href="https://my.feishu.cn/wiki/${state.pages[slug].node_token}"`:m)
 .replace(/href="\/guide\/([^".]+)(?:\.html)?"/g,'href="https://my.feishu.cn/wiki/Avarwm4uNiW4oFkywSMc33hvn1b"')
 .replace(/href="\/courses\/ai-agent(?:\.html)?"/g,'href="https://my.feishu.cn/wiki/Avarwm4uNiW4oFkywSMc33hvn1b"')
 .replace(/<a href="\/reference-agent\/[^\"]+">[^<]*<\/a>/g,'原始笔记随本地资料包保留');
}
for(const p of all){
 const xml=rewriteLinks(fs.readFileSync(`${dir}/${p.slug}.xml`,'utf8'));
 const target=`${dir}/upload-${p.slug}.xml`;fs.writeFileSync(target,xml);
 const hash=(await import('node:crypto')).createHash('sha256').update(xml).update(fs.readFileSync('docs/public/agent-diagrams/01-understand-1.png')).digest('hex');
 if(state.pages[p.slug].uploadedHash===hash){console.log('Already current',p.slug);continue;}
 const assessment=cli(['docs','+script','--command','parse','--content',`@./${target}`]);
 if(assessment.assessment?.status!=='passed')throw new Error(`Draft check failed ${p.slug}: ${JSON.stringify(assessment)}`);
 const result=cli(['docs','+update','--doc',state.pages[p.slug].obj_token,'--command','overwrite','--doc-format','xml','--content',`@./${target}`]);
 state.pages[p.slug].writeResult=result;save();
 if(result.result!=='success'||result.warnings?.length)throw new Error(`Upload degraded ${p.slug}: ${JSON.stringify(result)}`);
 const fetched=cli(['docs','+fetch','--doc',state.pages[p.slug].obj_token,'--detail','full']);
 fs.writeFileSync(`${dir}/remote-${p.slug}.json`,JSON.stringify(fetched,null,2));
 const text=fetched.document.content;
 const expected=(xml.match(/<img /g)||[]).length,actual=(text.match(/<img /g)||[]).length;
 if(expected!==actual)throw new Error(`Image count mismatch ${p.slug}: ${expected}/${actual}`);
 if(text.includes(':::')||text.includes('```mermaid'))throw new Error(`Unrendered markup ${p.slug}`);
 state.pages[p.slug].uploadedHash=hash;state.pages[p.slug].verified={images:actual,revision:fetched.document.revision_id};save();console.log('Uploaded and fetched',p.slug,`images=${actual}`);
}
for(const [group,node] of Object.entries(state.groups)){
 const xml=`<title>${escape(group)}</title><p>按照下方顺序阅读，也可以直接进入需要的主题。</p><ul>${pages.filter(p=>p.group===group).map(p=>`<li><a href="https://my.feishu.cn/wiki/${state.pages[p.slug].node_token}">${escape(p.title)}</a></li>`).join('')}</ul>`;
 const file=`${dir}/group-${parseInt(group)}.xml`;fs.writeFileSync(file,xml);
 const result=cli(['docs','+update','--doc',node.obj_token,'--command','overwrite','--doc-format','xml','--content',`@./${file}`]);
 if(result.result!=='success'||result.warnings?.length)throw new Error(`Group degraded ${group}`);
}
const rootXml=rewriteLinks(fs.readFileSync(`${dir}/index.xml`,'utf8'));
fs.writeFileSync(`${dir}/upload-index.xml`,rootXml);
const result=cli(['docs','+update','--doc',state.root.obj_token,'--command','overwrite','--doc-format','xml','--content',`@./${dir}/upload-index.xml`]);
if(result.result!=='success'||result.warnings?.length)throw new Error('Root upload degraded');
state.root.writeResult=result;save();
console.log('ROOT_URL',`https://my.feishu.cn/wiki/${state.root.node_token}`);
