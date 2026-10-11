/**
 * coderfather.com 学习地图数据
 *
 * 结构参考 mdldm.club/roadmap 的「主线分层 + 可选分支 + 个人路线」模型，
 * 但内容重写为面向零基础学习者的一条主线。
 *
 * 约定：
 *   - 主线（layers）按顺序走，编号 01–06。
 *   - 分支（branches）在主线的第 05 层之后才可选，编号顺延。
 *   - 每个课时都带 `minutes`，用于估算总时长与生成 7 天计划。
 */

const MINUTES_PER_HOUR = 60;

export const layers = [
  {
    id: 'mindset',
    number: '01',
    title: '搞懂 AI 到底能做什么',
    layer: '认知层',
    why: '先分清「聊天」和「办事」，知道什么该交给 AI，什么不该。',
    outcome: '能判断一个任务适不适合用 AI 做，并写出第一份任务描述。',
    prerequisite: '不需要任何基础',
    lessons: [
      { number: '01', title: 'AI 能做什么，不能做什么', minutes: 20, goal: '列出 3 件可以放心交给 AI 的事，和 3 件必须自己盯着的事。' },
      { number: '02', title: '大模型、Agent、工作流的区别', minutes: 25, goal: '用一句话向朋友解释这三者分别解决什么问题。' },
      { number: '03', title: '看懂一次完整的人机协作', minutes: 20, goal: '拆解一个真实任务，标出哪些步骤由你决定、哪些交给 AI。' }
    ]
  },
  {
    id: 'setup',
    number: '02',
    title: '把 AI 装进你的电脑',
    layer: '环境层',
    why: '装上能读文件、能动手的 AI 工具，不再只用网页聊天框。',
    outcome: '装好 Claude Code 或 Codex，完成第一次真实对话。',
    prerequisite: '一台电脑，会用浏览器',
    lessons: [
      { number: '01', title: '认识终端：不吓人的命令行入门', minutes: 30, goal: '能自己打开终端，看懂当前所在的目录，并用命令切换它。' },
      { number: '02', title: '安装 Node.js 与开发环境', minutes: 30, goal: '在终端执行 node -v 与 npm -v，都拿到版本号。' },
      { number: '03', title: '装上 Claude Code / Codex', minutes: 35, goal: '安装并完成登录，在终端里向 AI 提出第一个问题。' },
      { number: '04', title: '第一次让 AI 读写你的文件', minutes: 25, goal: '让 AI 新建一个文件、写入内容，再把它改掉。' }
    ]
  },
  {
    id: 'prompting',
    number: '03',
    title: '让 AI 听懂你的需求',
    layer: '提问层',
    why: '给上下文、定格式、做示例，把模糊想法变成可执行的指令。',
    outcome: '写出一份 AI 一次就能做对的提示词。',
    prerequisite: '完成第 02 层',
    lessons: [
      { number: '01', title: '提示词的四个要素', minutes: 25, goal: '用「角色 + 任务 + 约束 + 格式」重写一条你原来的提问。' },
      { number: '02', title: '给 AI 足够的上下文', minutes: 25, goal: '把一段背景资料交给 AI，对比它在有无上下文时的回答差异。' },
      { number: '03', title: '用示例和格式约束输出', minutes: 30, goal: '给一个示例，让 AI 稳定输出同样结构的表格或 JSON。' },
      { number: '04', title: '多轮对话与纠偏', minutes: 25, goal: '通过追问和纠正，把一次跑偏的回答拉回你要的结果。' }
    ]
  },
  {
    id: 'knowledge',
    number: '04',
    title: '让 AI 用上你自己的资料',
    layer: '知识层',
    why: '把笔记、文档、网页收进自己的文件系统，让 AI 随时读得到。',
    outcome: '建立个人知识库，并让 AI 基于你的资料回答问题。',
    prerequisite: '完成第 03 层',
    lessons: [
      { number: '01', title: '搭建个人知识库', minutes: 35, goal: '在一个文件夹里整理出你的第一批笔记，并让 AI 能读到它们。' },
      { number: '02', title: '文档切片与向量检索是什么', minutes: 30, goal: '给一篇长文做切片，说出为什么不能整篇直接丢给模型。' },
      { number: '03', title: '让 AI 基于资料回答：RAG 入门', minutes: 40, goal: '让 AI 只依据你的资料回答，并在资料里找不到时明确说不知道。' }
    ]
  },
  {
    id: 'building',
    number: '05',
    title: '让 AI 帮你真的做出东西',
    layer: '构建层',
    why: '从改一行代码开始，到最后做出一个能打开的页面。',
    outcome: '做出一个可以打开、可以演示的网页。',
    prerequisite: '完成第 04 层',
    lessons: [
      { number: '01', title: '读懂一个网页的结构', minutes: 25, goal: '打开浏览器开发者工具，指出页面里哪些是标题、哪些是列表。' },
      { number: '02', title: '让 AI 改你的第一行代码', minutes: 30, goal: '用一句话描述改动，让 AI 精确修改指定的一处。' },
      { number: '03', title: '做出一个能打开的页面', minutes: 45, goal: '在浏览器里打开一个属于你自己的页面，并能改标题和文字。' },
      { number: '04', title: '用 Git 保存你的每一次改动', minutes: 30, goal: '完成第一次 commit，并能回到之前的版本。' }
    ]
  },
  {
    id: 'delivery',
    number: '06',
    title: '让作品真正上线',
    layer: '交付层',
    why: '部署、域名、接用户，把「我这里能跑」变成「别人也能用」。',
    outcome: '得到一个有真实链接、能分享给别人的作品。',
    prerequisite: '完成第 05 层',
    lessons: [
      { number: '01', title: '部署到 Vercel 或 Cloudflare', minutes: 35, goal: '拿到一条公网链接，用手机也能打开你做的页面。' },
      { number: '02', title: '绑定你自己的域名', minutes: 25, goal: '让作品在你的域名下打开，而不是一串随机子域。' },
      { number: '03', title: '加上登录与数据存储', minutes: 45, goal: '让访客能注册登录，并且刷新后数据还在。' },
      { number: '04', title: '让别人试用并收集反馈', minutes: 20, goal: '收集到 3 条真实反馈，并挑出其中一条动手改掉。' }
    ]
  }
]

export const branches = [
  {
    id: 'content',
    number: '07',
    title: '内容创作',
    layer: '创作分支',
    audience: '做公众号、小红书或视频，想把重复劳动交给 AI 的人。',
    chain: ['选题与素材收集', 'AI 辅助写作', '一键排版与配图', '多平台分发'],
    minutes: 180
  },
  {
    id: 'data',
    number: '08',
    title: '数据分析',
    layer: '数据分支',
    audience: '想让 AI 帮忙处理表格、看懂数据、直接出结论的人。',
    chain: ['读 Excel / CSV', '数据清洗', '生成图表', '结论与报告'],
    minutes: 150
  },
  {
    id: 'automation',
    number: '09',
    title: '自动化',
    layer: '自动化分支',
    audience: '想把每天重复的操作交给 AI 自动跑完的人。',
    chain: ['定时任务', '自动化脚本', '消息推送', '多步工作流'],
    minutes: 165
  }
]

export const projects = [
  {
    id: 'personal-site',
    title: '个人网站 + AI 助手',
    difficulty: '入门',
    description: '把第 05、06 层的结果合起来：一个属于你自己的页面，还能回答访客的问题。',
    stack: ['HTML / CSS', 'Claude Code', 'Cloudflare Pages']
  },
  {
    id: 'knowledge-qa',
    title: '行业知识库问答',
    difficulty: '进阶',
    description: '挑一个你熟悉的领域，把资料整理成知识库，做成能回答问题的助手。',
    stack: ['文件系统', '向量检索', 'RAG']
  },
  {
    id: 'content-pipeline',
    title: '自动化内容流水线',
    difficulty: '进阶',
    description: '从选题到发布串成一条自动化链路，把每周要花一天的事压缩到十分钟。',
    stack: ['定时任务', 'API 调用', '消息推送']
  }
]

/**
 * 个人路线问卷。每道题的每个选项都带 `boost`：
 * 命中的层会排到 7 天计划的前面。
 */
export const quiz = [
  {
    id: 'goal',
    question: '你最想用 AI 做什么？',
    options: [
      { value: 'work', label: '工作提效', boost: ['prompting', 'setup'] },
      { value: 'write', label: '写内容', boost: ['prompting', 'content'] },
      { value: 'data', label: '看数据', boost: ['knowledge', 'data'] },
      { value: 'code', label: '学编程', boost: ['setup', 'building'] },
      { value: 'product', label: '做产品', boost: ['building', 'delivery'] },
      { value: 'auto', label: '自动化', boost: ['setup', 'automation'] }
    ]
  },
  {
    id: 'level',
    question: '你现在的基础？',
    options: [
      { value: 'zero', label: '完全零基础', boost: ['mindset'], skip: ['setup'] },
      { value: 'chat', label: '用过聊天工具', boost: ['prompting'], skip: [] },
      { value: 'code', label: '写过一点代码', boost: ['building'], skip: ['setup', 'mindset'] },
      { value: 'dev', label: '有开发经验', boost: ['knowledge', 'building'], skip: ['mindset', 'setup'] }
    ]
  },
  {
    id: 'time',
    question: '你每周能投入多久？',
    options: [
      { value: 'low', label: '每天 30 分钟', pace: 30 },
      { value: 'mid', label: '每周 2–3 小时', pace: 45 },
      { value: 'high', label: '每周半天以上', pace: 60 }
    ]
  }
]

/** 把课时时长按投入节奏切成 7 天的计划。 */
const DAYS_PER_WEEK = 7

export function buildPersonalRoute(answers) {
  const chosen = quiz.map((q) => q.options.find((o) => o.value === answers?.[q.id])).filter(Boolean)
  const boost = chosen.flatMap((o) => o.boost || [])
  const skip = chosen.flatMap((o) => o.skip || [])
  const pace = chosen.find((o) => o.pace)?.pace ?? 30

  // 主线按「命中程度」重排：被 boost 的提前，被 skip 的仍然保留但靠后。
  const ordered = [...layers].sort((a, b) => {
    const score = (l) => (skip.includes(l.id) ? -1 : 0) + (boost.includes(l.id) ? 1 : 0)
    return score(b) - score(a) || Number(a.number) - Number(b.number)
  })

  // 一节课都不丢：skip 只让它整层往后排，不删内容。
  // 页面上的承诺是「不跳过任何一层，该看的都会看到」，这里必须对得上。
  const tasks = ordered.flatMap((layer) => layer.lessons.map((lesson) => ({ layer, lesson })))

  // 顺着走、装满一天再开下一天。绝不跨层交替——
  // 新人最怕的就是第一天同时被塞「提示词四要素」和「改第一行代码」，
  // 前一层还没走通就跳下一层，等于没有路线。
  const allDays = []
  let current = { day: 1, tasks: [], minutes: 0 }
  for (const task of tasks) {
    const minutes = task.lesson.minutes || 0
    // 每天至少安排一节课，哪怕它本身比 pace 还长，否则会出现空转的天。
    if (current.tasks.length && current.minutes + minutes > pace) {
      allDays.push(current)
      current = { day: current.day + 1, tasks: [], minutes: 0 }
    }
    current.tasks.push(task)
    current.minutes += minutes
  }
  if (current.tasks.length) allDays.push(current)

  return {
    pace,
    deferred: ordered.filter((l) => skip.includes(l.id)).map((l) => l.id),
    // 只展示开头这几天（「起步路线」），但要如实告诉人一共要走多少天。
    days: allDays.slice(0, DAYS_PER_WEEK),
    totalDays: allDays.length,
    totalMinutes: tasks.reduce((sum, t) => sum + t.lesson.minutes, 0)
  }
}

export function totalMinutes(list = layers) {
  return list.reduce((sum, l) => sum + l.lessons.reduce((s, x) => s + x.minutes, 0), 0)
}

export function hours(minutes) {
  const value = minutes / MINUTES_PER_HOUR
  return value >= 10 ? Math.round(value) : Math.round(value * 10) / 10
}

export const stats = {
  layers: layers.length,
  lessons: layers.reduce((sum, l) => sum + l.lessons.length, 0),
  branches: branches.length,
  projects: projects.length,
  minutes: totalMinutes()
}
