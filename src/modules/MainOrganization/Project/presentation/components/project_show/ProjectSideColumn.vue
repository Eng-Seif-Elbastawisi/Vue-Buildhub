<script setup lang="ts">
  import { computed } from 'vue';
  import type { ProjectPreview, ProjectStatItem } from './projectShow.types';

  const props = withDefaults(
    defineProps<{
      imageSource: string;
      projectTitle: string;
      stats: ProjectStatItem[];
      preview: ProjectPreview | null;
      previewTitle: string;
      noPreviewLabel: string;
      previewDateLabel: string;
      previewTimeLabel: string;
      notificationTypeLabel: string;
      notificationMessageLabel: string;
      siteLinkLabel: string;
      addressLabel: string;
      emptyValue: string;
      termsLabel?: string;
      terms?: string;
      formatDate: (value?: string | null) => string;
      formatTime: (value?: string | null) => string;
      valueOrEmpty: (value?: string | number | null) => string;
    }>(),
    {
      terms: '',
      termsLabel: '',
    },
  );

  const termLines = computed(() =>
    props.terms
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  );
</script>

<template>
  <aside class="project-side-column">
    <article class="image-card">
      <img :src="imageSource" :alt="projectTitle" />
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <i :class="stat.icon"></i>
          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
        </div>
      </div>
    </article>

    <article id="project-preview" class="project-card preview-card">
      <div class="card-title">
        <i class="pi pi-calendar"></i>
        <h2>{{ previewTitle }}</h2>
      </div>

      <RouterLink
        v-if="!preview"
        class="empty-panel empty-panel--link"
        :to="`/project_preview/add?project_id=${25}`"
      >
        <i class="pi pi-plus-circle"></i>

        <span>
          {{ noPreviewLabel }}
        </span>
      </RouterLink>

      <!-- <div v-if="!preview" class="empty-panel">
        {{ noPreviewLabel }}
      </div> -->

      <div v-else class="preview-grid">
        <div class="side-info">
          <i class="pi pi-calendar"></i>
          <span>{{ previewDateLabel }}</span>
          <strong>{{ formatDate(preview.preview_date) }}</strong>
        </div>
        <div class="side-info">
          <i class="pi pi-bell"></i>
          <span>{{ notificationTypeLabel }}</span>
          <strong>{{ valueOrEmpty(preview.notification_type) }}</strong>
        </div>
        <div class="side-info">
          <i class="pi pi-clock"></i>
          <span>{{ previewTimeLabel }}</span>
          <strong>{{ formatTime(preview.preview_time) }}</strong>
        </div>
        <div class="side-info">
          <i class="pi pi-comment"></i>
          <span>{{ notificationMessageLabel }}</span>
          <strong>{{ valueOrEmpty(preview.notification_message) }}</strong>
        </div>
        <div class="side-info side-info--wide">
          <i class="pi pi-link"></i>
          <span>{{ siteLinkLabel }}</span>
          <a v-if="preview.site_link" :href="preview.site_link" target="_blank" rel="noopener">
            {{ preview.site_link }}
          </a>
          <strong v-else>{{ emptyValue }}</strong>
        </div>
        <div class="side-info side-info--wide">
          <i class="pi pi-map-marker"></i>
          <span>{{ addressLabel }}</span>
          <strong>{{ valueOrEmpty(preview.address) }}</strong>
        </div>
      </div>
    </article>

    <article id="project-terms" class="project-card terms-card">
      <div class="card-title">
        <i class="pi pi-file-edit"></i>
        <h2>{{ termsLabel }}</h2>
      </div>

      <div v-if="termLines.length" class="terms-list">
        <p v-for="(line, index) in termLines" :key="`${index}-${line}`">
          {{ line }}
        </p>
      </div>

      <div v-else class="empty-panel">
        {{ emptyValue }}
      </div>
    </article>
  </aside>
</template>
