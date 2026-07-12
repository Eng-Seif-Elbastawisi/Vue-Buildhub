<script setup lang="ts">
  import type { ProjectInfoItem } from './projectShow.types';

  defineProps<{
    title: string;
    items: ProjectInfoItem[];
  }>();
</script>

<template>
  <article id="project-data" class="project-card project-info-card">
    <div class="card-title">
      <i class="pi pi-building"></i>
      <h2>{{ title }}</h2>
    </div>

    <div class="project-info-grid">
      <div v-for="info in items" :key="info.label" class="info-item">
        <i :class="info.icon" aria-hidden="true"></i>
        <div class="project-info-contant">
          <span>{{ info.label }}</span>
          <strong v-if="!info.badge">{{ info.value }}</strong>
          <strong v-if="info.meta">{{ info.meta }}</strong>
          <span v-if="info.badge" class="status-badge status-badge--inline" :class="info.badge">
            {{ info.value }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
