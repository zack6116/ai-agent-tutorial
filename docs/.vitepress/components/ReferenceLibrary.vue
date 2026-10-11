<script setup>
import { library } from '../data/reference-library.mjs'
defineProps({ kind: { type: String, required: true } })
</script>

<template>
  <div class="reference-library">
    <article v-for="(card, i) in library[kind]" :key="card.title" class="reference-card">
      <div class="reference-cover" :class="`cover-${i % 6}`" aria-hidden="true">{{ card.cover }}</div>
      <div class="reference-card-body">
        <h3>{{ card.title }}</h3>
        <p class="reference-author">{{ card.author }}</p>
        <p>{{ card.description }}</p>
        <a v-if="card.url" :href="card.url" target="_blank" rel="noreferrer">查看资料 ↗</a>
        <p v-if="card.note" class="reference-note">{{ card.note }}</p>
        <p v-if="card.rating" class="reference-rating" :aria-label="`原图评分 ${card.rating}/5`" style="color: #d7a728; letter-spacing: 2px">{{ '★'.repeat(card.rating) }}{{ '☆'.repeat(5-card.rating) }} <small style="color:#737982;letter-spacing:0">原图评分</small></p>
        <div class="reference-meta"><span>{{ card.tag }}</span><time v-if="card.date">{{ card.date }}</time></div>
      </div>
    </article>
  </div>
</template>
