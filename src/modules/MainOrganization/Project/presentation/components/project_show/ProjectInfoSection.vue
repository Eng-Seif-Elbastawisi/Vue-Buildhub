<script setup lang="ts">
  import { computed } from 'vue';
  import type { ProjectInfoItem } from './projectShow.types';

  const props = defineProps<{
    title: string;
    items: ProjectInfoItem[];
    additionalDetailsLabel: string;
  }>();

  const summaryItems = computed(() => props.items.slice(0, 8));
  const additionalItems = computed(() => props.items.slice(8));
</script>

<template>
  <article id="project-data" class="project-card project-info-card">
    <div class="card-title">
      <i class="pi pi-building"></i>
      <h2>{{ title }}</h2>
    </div>

    <div class="project-info-summary-grid">
      <div v-for="projectInfo in summaryItems" :key="projectInfo.label" class="project-info-field">
        <i :class="projectInfo.icon" aria-hidden="true"></i>
        <div class="project-info-field__content">
          <span>{{ projectInfo.label }}</span>
          <strong
            v-if="!projectInfo.badge"
            :title="projectInfo.value.length <= 160 ? projectInfo.value : undefined"
          >
            {{ projectInfo.value }}
          </strong>
          <small v-if="projectInfo.meta" :title="projectInfo.meta">{{ projectInfo.meta }}</small>
          <span
            v-if="projectInfo.badge"
            class="status-badge status-badge--inline"
            :class="projectInfo.badge"
          >
            {{ projectInfo.value }}
          </span>
        </div>
      </div>
    </div>

    <details v-if="additionalItems.length" class="project-info-disclosure">
      <summary>
        <span>{{ additionalDetailsLabel }}</span>
        <i class="pi pi-chevron-down" aria-hidden="true"></i>
      </summary>

      <div class="project-info-additional-grid">
        <div
          v-for="projectInfo in additionalItems"
          :key="projectInfo.label"
          class="project-info-field"
        >
          <i :class="projectInfo.icon" aria-hidden="true"></i>
          <div class="project-info-field__content">
            <span>{{ projectInfo.label }}</span>
            <strong
              class="project-safe-value"
              :title="projectInfo.value.length <= 160 ? projectInfo.value : undefined"
            >
              {{ projectInfo.value }}
            </strong>
          </div>
        </div>
      </div>
    </details>
  </article>
</template>
