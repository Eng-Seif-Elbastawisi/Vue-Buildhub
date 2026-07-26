<script setup lang="ts">
  import type { ProjectStatItem } from './projectShow.types';

  defineProps<{
    title: string;
    stats: ProjectStatItem[];
  }>();
</script>

<template>
  <section id="project-overview" class="project-stats" :aria-label="title">
    <article
      v-for="(stat, index) in stats"
      :key="stat.label"
      class="project-stat-card"
      :class="`project-stat-card--tone-${(index % 4) + 1}`"
    >
      <span class="project-stat-card__icon" aria-hidden="true">
        <i :class="stat.icon"></i>
      </span>

      <div>
        <span>{{ stat.label }}</span>
        <strong>{{ stat.value }}</strong>
        <small>{{ stat.caption }}</small>
      </div>
    </article>
  </section>
</template>
