<script setup lang="ts">
  import { computed, ref } from 'vue';
  import Accordion from 'primevue/accordion';
  import AccordionPanel from 'primevue/accordionpanel';
  import AccordionHeader from 'primevue/accordionheader';
  import AccordionContent from 'primevue/accordioncontent';
  import type { RouteLocationRaw } from 'vue-router';
  import type { ProjectPreview, ProjectStatItem } from './projectShow.types';

  const props = withDefaults(
    defineProps<{
      imageSource: string;
      projectTitle: string;
      stats: ProjectStatItem[];
      preview: ProjectPreview | null;
      previews?: ProjectPreview[];
      hasProjectFloors: boolean;
      addItemTo: RouteLocationRaw;
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
      previews: () => [],
      terms: '',
      termsLabel: '',
    },
  );

  const displayPreviews = computed(() => {
    if (props.previews.length) return props.previews;
    if (props.preview) return [props.preview];

    return [];
  });
  const activePreview = ref('0');

  const toPositiveInteger = (value: unknown): number | undefined => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    const numberValue = Number(normalizedValue);

    return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
  };

  const getProjectId = (): number | undefined => {
    if (
      typeof props.addItemTo !== 'object' ||
      props.addItemTo === null ||
      !('query' in props.addItemTo)
    ) {
      return undefined;
    }

    return toPositiveInteger(props.addItemTo.query?.project_id);
  };

  const hasValidPreviewId = (previewItem: ProjectPreview) => {
    return toPositiveInteger(previewItem.id) !== undefined;
  };

  const getEditPreviewRoute = (previewItem: ProjectPreview): RouteLocationRaw => {
    const projectPreviewId = toPositiveInteger(previewItem.id);
    const projectId = getProjectId();

    return {
      name: 'edit-project_preview',
      params: {
        project_preview_id: projectPreviewId,
      },
      ...(projectId
        ? {
            query: {
              project_id: projectId,
            },
          }
        : {}),
    };
  };

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
        v-if="!displayPreviews.length"
        class="empty-panel empty-panel--link"
        :to="addItemTo"
      >
        <i class="pi pi-plus-circle"></i>

        <span>
          {{ noPreviewLabel }}
        </span>
      </RouterLink>

      <!-- <div v-if="!preview" class="empty-panel">
        {{ noPreviewLabel }}
      </div> -->

      <Accordion v-else v-model:value="activePreview" class="department-accordion">
        <AccordionPanel
          v-for="(previewItem, index) in displayPreviews"
          :key="previewItem.id ?? index"
          :value="index.toString()"
          class="department-panel"
        >
          <AccordionHeader class="department-panel__header">
            <div class="department-header-content">
              <span class="department-icon" aria-hidden="true">
                <i class="pi pi-calendar"></i>
              </span>

              <div class="department-title-group">
                <span>{{ previewDateLabel }}</span>
                <strong>{{ formatDate(previewItem.preview_date) }}</strong>
                <small>
                  <i class="pi pi-clock"></i>
                  {{ previewTimeLabel }} {{ formatTime(previewItem.preview_time) }}
                </small>
              </div>

              <div class="department-header-meta">
                <span class="department-count-pill">
                  {{ valueOrEmpty(previewItem.notification_type) }}
                </span>
              </div>
            </div>
          </AccordionHeader>

          <AccordionContent class="department-panel__content">
            <div class="preview-grid">
              <!-- <div class="side-info">
                <i class="pi pi-bell"></i>
                <span>{{ notificationTypeLabel }}</span>
                <strong>{{ valueOrEmpty(previewItem.notification_type) }}</strong>
              </div>
              <div class="side-info">
                <i class="pi pi-comment"></i>
                <span>{{ notificationMessageLabel }}</span>
                <strong>{{ valueOrEmpty(previewItem.notification_message) }}</strong>
              </div> -->
              <div class="side-info side-info--wide border-top-0">
                <i class="pi pi-link"></i>
                <span>{{ siteLinkLabel }}</span>
                <a
                  v-if="previewItem.site_link"
                  :href="previewItem.site_link"
                  target="_blank"
                  rel="noopener"
                >
                  {{ previewItem.site_link }}
                </a>
                <strong v-else>{{ emptyValue }}</strong>
              </div>
              <div class="side-info side-info--wide">
                <i class="pi pi-map-marker"></i>
                <span>{{ addressLabel }}</span>
                <strong>{{ valueOrEmpty(previewItem.address) }}</strong>
              </div>
            </div>

            <RouterLink
              v-if="hasValidPreviewId(previewItem) && !hasProjectFloors"
              class="project-action-btn project-action-btn--primary preview-edit-action"
              :to="getEditPreviewRoute(previewItem)"
            >
              <i class="pi pi-pencil"></i>
              {{ $t('Edit') }} {{ $t('Project.steps.project_preview') }}
            </RouterLink>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
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

<style scoped>
  .preview-edit-action {
    width: 100%;
    margin-top: 1rem;
  }

  .side-info--wide.border-top-0 {
    border-top: 0;
  }
</style>
