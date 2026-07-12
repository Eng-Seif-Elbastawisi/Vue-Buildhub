<script setup lang="ts">
  import type { ProjectShowRaw, StatusMeta } from './projectShow.types';

  defineProps<{
    project: ProjectShowRaw;
    projectTitle: string;
    statusMeta: StatusMeta;
    projectCodeLabel: string;
    createdAtLabel: string;
    downloadPdfLabel: string;
    generatingPdfLabel: string;
    editProjectLabel: string;
    exportingPdf: boolean;
    convertActionLabel?: string;
    convertActionDisabled?: boolean;
    formatDate: (value?: string | null) => string;
    formatTime: (value?: string | null) => string;
  }>();

  defineEmits<{
    downloadPdf: [];
    convertStatusAction: [];
  }>();
</script>

<template>
  <header class="project-hero">
    <div class="project-hero__body">
      <div class="project-hero__content">
        <div class="project-title-row">
          <h1>{{ projectTitle }}</h1>
          <span class="status-badge" :class="statusMeta.className">
            {{ statusMeta.label }}
          </span>
        </div>

        <div class="project-meta-row">
          <span><i class="pi pi-id-card"></i>{{ projectCodeLabel }}: {{ project.id }}</span>
          <span><i class="pi pi-calendar"></i>{{ formatDate(project.date) }}</span>
          <span
            ><i class="pi pi-clock"></i>{{ createdAtLabel }}
            {{ formatTime(project.created_at) }}</span
          >
        </div>
      </div>

      <div class="project-actions">
        <button
          class="project-action-btn"
          type="button"
          :disabled="exportingPdf"
          @click="$emit('downloadPdf')"
        >
          <i class="pi pi-download"></i>
          {{ exportingPdf ? generatingPdfLabel : downloadPdfLabel }}
        </button>

        <button
          v-if="convertActionLabel"
          type="button"
          class="btn btn-primary"
          :disabled="convertActionDisabled"
          @click="$emit('convertStatusAction')"
        >
          {{ convertActionLabel }}
        </button>

        <RouterLink
          class="project-action-btn project-action-btn--primary"
          :to="{ name: 'edit-project', params: { project_id: project.id } }"
        >
          <i class="pi pi-pencil"></i>
          {{ editProjectLabel }}
        </RouterLink>
      </div>
    </div>
  </header>
</template>
