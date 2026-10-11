<script setup>
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { configureApiBase } from '../lib/session.js'

const { page, site } = useData()

/**
 * 把站点 base 告诉学习区。
 *
 * 站点同时挂在根路径和 coderfather.com/ai/ 子路径下，代理会把 site.base
 * 改写成 '/ai/'。接口前缀必须跟它一致，否则子路径下的登录请求会 404。
 * 在这里同步调用：早于任何页面组件的 onMounted 取数。
 */
configureApiBase(site.value.base)
const isGuide = computed(() => page.value.relativePath.startsWith('guide/'))
const isReplica = computed(() => page.value.relativePath.startsWith('replica/'))
const isLearning = computed(() => /^(roadmap|learn)\//.test(page.value.relativePath))
</script>

<template>
  <div :class="{ 'guide-layout': isGuide || isReplica, 'replica-layout': isReplica, 'learning-layout': isLearning }">
    <DefaultTheme.Layout>
      <template #doc-before>
        <nav v-if="isGuide || isReplica" class="guide-breadcrumb" aria-label="面包屑导航">
          <a :href="withBase('/')">AI 编程实战</a>
          <span aria-hidden="true">/</span>
          <a :href="withBase(isReplica ? '/replica/' : '/guide/01-mindset.html')">{{ isReplica ? 'AI Agent 搭建知识库' : 'Agent 学习文档' }}</a>
          <span class="guide-edition">原理 · 案例 · 实践</span>
        </nav>
      </template>
    </DefaultTheme.Layout>
  </div>
</template>
