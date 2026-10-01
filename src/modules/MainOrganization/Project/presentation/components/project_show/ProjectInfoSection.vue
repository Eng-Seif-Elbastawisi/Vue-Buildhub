<script setup lang="ts">
  import { computed } from 'vue';
  import type { ProjectInfoItem } from './projectShow.types';

  const props = defineProps<{
    title: string;
    items: ProjectInfoItem[];
    additionalDetailsLabel: string;
    imageSource?: string;
    fallbackImageSource?: string;
    imageAlt?: string;
  }>();

  const summaryItems = computed(() => props.items.slice(0, 8));
  const additionalItems = computed(() => props.items.slice(8));

  const useFallbackImage = (event: Event) => {
    const image = event.currentTarget as HTMLImageElement;

    if (!props.fallbackImageSource || image.dataset.fallbackApplied === 'true') return;

    image.dataset.fallbackApplied = 'true';
    image.src = props.fallbackImageSource;
  };
</script>

<template>
  <details id="project-data" class="project-card project-info-card project-section-disclosure" open>
    <summary class="card-title">
      <i class="pi pi-database"></i>
      <h2>{{ title }}</h2>
      <i class="pi pi-chevron-down project-disclosure-chevron" aria-hidden="true"></i>
    </summary>

    <div class="project-info-body" :class="{ 'project-info-body--with-media': imageSource }">
      <div v-if="imageSource" class="project-info-media">
        <img :src="imageSource" :alt="imageAlt || ''" loading="lazy" @error="useFallbackImage" />
      </div>

      <div class="project-info-summary-grid">
        <div
          v-for="projectInfo in summaryItems"
          :key="projectInfo.label"
          class="project-info-field"
        >
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
  </details>
</template>
