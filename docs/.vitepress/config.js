import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import replicaSidebar from './data/replica-sidebar.json'

export default withMermaid(
  defineConfig({
    title: "AI 编程实战",
    description: "从 0 到 1 打造可交付、高可用的企业级智能体系统（商业交付版）",
    transformPageData(pageData) {
      // 线上经 coderfather-router 以 /ai/ 前缀提供服务，canonical/og:url 用带前缀的正式域名
      const canonicalUrl = `https://coderfather.com/ai/${pageData.relativePath.replace(/(^|\/)index\.md$/, '').replace(/\.md$/, '/')}`
      const home = pageData.relativePath === 'index.md'
      const url = home ? 'https://coderfather.com/ai/' : canonicalUrl
      const title = pageData.title || pageData.frontmatter?.title || 'AI 编程实战'
      const desc = pageData.description || pageData.frontmatter?.description || '从 0 到 1 打造可交付、高可用的企业级智能体系统（商业交付版）'
      pageData.frontmatter.head = [
        ...(pageData.frontmatter.head || []),
        ['link', { rel: 'canonical', href: url }],
        ['meta', { property: 'og:type', content: 'article' }],
        ['meta', { property: 'og:site_name', content: 'AI 编程实战' }],
        ['meta', { property: 'og:title', content: title }],
        ['meta', { property: 'og:description', content: desc }],
        ['meta', { property: 'og:url', content: url }],
        ['meta', { property: 'og:image', content: 'https://coderfather.com/og.png' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['script', { type: 'application/ld+json' }, JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: title.slice(0, 110),
          description: desc,
          url,
          inLanguage: 'zh-CN',
          author: { '@type': 'Person', name: 'Zack' },
          publisher: { '@type': 'Organization', name: 'CoderFather', url: 'https://coderfather.com/' },
          isAccessibleForFree: true,
        })],
      ]
    },
    head: [
      ['link', { rel: 'icon', href: '/favicon.ico' }],
      ['style', {}, `
        /* 彻底解决 VitePress 默认段落样式对 Mermaid 图内文字的挤压遮挡 */
        .vp-doc .mermaid {
          display: flex;
          justify-content: center;
          margin: 28px 0;
          overflow-x: auto;
        }
        .vp-doc .mermaid svg {
          max-width: 100%;
          height: auto;
          overflow: visible !important;
        }
        .vp-doc .mermaid svg foreignObject {
          overflow: visible !important;
        }
        .vp-doc .mermaid svg foreignObject div {
          overflow: visible !important;
        }
        .vp-doc .mermaid svg foreignObject p,
        .vp-doc .mermaid svg .nodeLabel p,
        .vp-doc .mermaid svg .edgeLabel p,
        .vp-doc .mermaid svg .cluster-label p {
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1.35 !important;
        }
        .vp-doc .mermaid svg .label {
          line-height: 1.35 !important;
        }
      `]
    ],
    markdown: {
      lineNumbers: true
    },
    mermaid: {
      theme: 'neutral',
      securityLevel: 'loose',
      flowchart: {
        htmlLabels: true,
        padding: 15
      }
    },
    themeConfig: {
      siteTitle: 'AI 编程实战',
      nav: [
        { text: '学习地图', link: '/roadmap/' },
        { text: '免费学习', link: '/learn/' },
        { text: 'Agent 知识库', link: '/replica/' },
        { text: '课程书柜', link: '/#courses' },
        { text: '联系微信', link: '/contact' }
      ],
      sidebar: {
        '/replica/': [
          { text: 'AI Agent 搭建知识库', link: '/replica/' },
          ...replicaSidebar,
          { text: '配套全景图', link: '/replica/16-atlas' },
          { text: '工程补充 · 九章教程', link: '/guide/01-mindset' }
        ],
        '/guide/': [
          {
            text: '从这里开始',
            items: [
              { text: '01  从零理解 Agent', link: '/guide/01-mindset' },
              { text: '02  学习路线与第一个接口', link: '/guide/02-roadmap' }
            ]
          },
          {
            text: '理解原理 · 动手搭建',
            items: [
              { text: '03  规划、行动与记忆', link: '/guide/03-core-theory' },
              { text: '04  让模型调用工具', link: '/guide/04-tech-foundations' },
              { text: '05  搭建 RAG 知识库', link: '/guide/05-rag-pipeline' },
              { text: '06  工作流与框架选型', link: '/guide/06-frameworks' }
            ]
          },
          {
            text: '案例实践 · 工程交付',
            items: [
              { text: '07  三个业务案例拆解', link: '/guide/07-enterprise-cases' },
              { text: '08  评测、上线与作品集', link: '/guide/08-production-career' },
              { text: '09  命令与术语速查', link: '/guide/09-appendix' },
              { text: '手绘知识卡 · 换一种读法', link: '/courses/ai-agent' }
            ]
          }
        ]
      },
      outline: { level: [2, 3], label: '本页目录' },
      docFooter: { prev: '上一章', next: '下一章' },
      returnToTopLabel: '回到顶部',
      sidebarMenuLabel: '课程目录',
      darkModeSwitchLabel: '切换阅读主题',
      search: { provider: 'local', options: { locales: { root: { translations: {
        button: { buttonText: '搜索文档', buttonAriaLabel: '搜索学习文档' },
        modal: { noResultsText: '没有找到相关内容', resetButtonTitle: '清空搜索', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } }
      } } } } },
      socialLinks: [
        { icon: 'github', link: 'https://github.com/zack6116/ai-agent-tutorial' }
      ],
      footer: {
        message: '商业实战出版级教程 | 严禁未授权翻印传播',
        copyright: 'Copyright © 2026 AI Agent 实战教程'
      }
    }
  })
)
