<script setup lang="ts">
  import type { ProjectInfoItem, ProjectPricingRow } from './projectShow.types';

  defineProps<{
    title: string;
    pricing?: ProjectPricingRow | null;
    items: ProjectInfoItem[];
    emptyLabel: string;
  }>();
</script>

<template>
  <article id="project-pricing" class="project-card project-pricing-card">
    <div class="card-title">
      <i class="pi pi-wallet"></i>
      <h2>{{ title }}</h2>
    </div>

    <div v-if="!pricing" class="empty-panel">
      {{ emptyLabel }}
    </div>

    <div v-else class="project-info-grid project-pricing-grid">
      <div v-for="info in items" :key="info.label" class="info-item">
        <i :class="info.icon" aria-hidden="true"></i>
        <div class="project-info-contant">
          <span>{{ info.label }}</span>
          <strong>{{ info.value }}</strong>
        </div>
      </div>
    </div>
  </article>
</template>
