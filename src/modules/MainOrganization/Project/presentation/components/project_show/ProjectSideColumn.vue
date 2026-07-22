<script setup lang="ts">
  import { computed, ref } from 'vue';
  import type { RouteLocationRaw } from 'vue-router';
  import type { ProjectPreview } from './projectShow.types';
  import projectPreviewHouseBackground from '@/assets/images/project-preview-house-background.svg';

  const props = withDefaults(
    defineProps<{
      preview: ProjectPreview | null;
      previews?: ProjectPreview[];
      hasProjectFloors: boolean;
      addItemTo: RouteLocationRaw;
      previewTitle: string;
      noPreviewLabel: string;
      previewDateLabel: string;
      previewTimeLabel: string;
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

  const activePreviewItem = computed(() => {
    return displayPreviews.value[Number(activePreview.value)] ?? displayPreviews.value[0] ?? null;
  });

  const safeSiteLink = computed(() => {
    const siteLink = activePreviewItem.value?.site_link?.trim();

    return siteLink && /^https?:\/\/\S+$/i.test(siteLink) ? siteLink : null;
  });

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
    <details id="project-preview" class="project-card preview-card project-section-disclosure">
      <summary class="card-title">
        <i class="pi pi-calendar"></i>
        <h2>{{ previewTitle }}</h2>
        <i class="pi pi-chevron-down project-disclosure-chevron" aria-hidden="true"></i>
      </summary>

      <RouterLink
        v-if="!displayPreviews.length"
        class="empty-panel empty-panel--link"
        :to="addItemTo"
      >
        <i class="pi pi-plus-circle"></i>
        <span>{{ noPreviewLabel }}</span>
      </RouterLink>

      <div v-else-if="activePreviewItem" class="project-preview-compact">
        <img
          class="project-preview-illustration"
          :src="projectPreviewHouseBackground"
          alt=""
          aria-hidden="true"
        />

        <select
          v-if="displayPreviews.length > 1"
          v-model="activePreview"
          class="project-preview-selector"
          :aria-label="previewTitle"
        >
          <option
            v-for="(previewOption, previewIndex) in displayPreviews"
            :key="previewOption.id ?? previewIndex"
            :value="previewIndex.toString()"
          >
            {{ formatDate(previewOption.preview_date) }}
          </option>
        </select>

        <div class="project-preview-date">
          <span class="project-preview-date__icon" aria-hidden="true">
            <i class="pi pi-calendar"></i>
          </span>
          <div>
            <small>{{ previewDateLabel }}</small>
            <strong>{{ formatDate(activePreviewItem.preview_date) }}</strong>
            <span>
              <i class="pi pi-clock" aria-hidden="true"></i>
              {{ previewTimeLabel }} {{ formatTime(activePreviewItem.preview_time) }}
            </span>
          </div>
        </div>

        <div class="project-preview-fields">
          <div class="project-preview-field">
            <i class="pi pi-link" aria-hidden="true"></i>
            <div>
              <small>{{ siteLinkLabel }}</small>
              <a
                v-if="safeSiteLink"
                class="project-safe-value project-safe-value--clamped"
                :href="safeSiteLink"
                :title="safeSiteLink"
                target="_blank"
                rel="noopener"
              >
                {{ safeSiteLink }}
              </a>
              <strong v-else class="project-safe-value project-safe-value--clamped">
                {{ valueOrEmpty(activePreviewItem.site_link) }}
              </strong>
            </div>
          </div>

          <details class="project-preview-field project-preview-address">
            <summary>
              <i class="pi pi-map-marker" aria-hidden="true"></i>
              <div>
                <small>{{ addressLabel }}</small>
                <strong class="project-safe-value project-safe-value--clamped">
                  {{ valueOrEmpty(activePreviewItem.address) }}
                </strong>
              </div>
            </summary>
            <p class="project-safe-value project-preview-address__full">
              {{ valueOrEmpty(activePreviewItem.address) }}
            </p>
          </details>
        </div>

        <RouterLink
          v-if="hasValidPreviewId(activePreviewItem) && !hasProjectFloors"
          class="project-preview-edit-action"
          :aria-label="`${$t('Edit')} ${$t('Project.steps.project_preview')}`"
          :title="`${$t('Edit')} ${$t('Project.steps.project_preview')}`"
          :to="getEditPreviewRoute(activePreviewItem)"
        >
          <i class="pi pi-sliders-h" aria-hidden="true"></i>
        </RouterLink>
      </div>
    </details>

    <slot />

    <details id="project-terms" class="project-terms-disclosure">
      <summary class="card-title">
        <i class="pi pi-file-edit"></i>
        <h2>{{ termsLabel }}</h2>
        <i class="pi pi-chevron-down project-disclosure-chevron" aria-hidden="true"></i>
      </summary>

      <div v-if="termLines.length" class="terms-list">
        <p v-for="(termLine, termIndex) in termLines" :key="`${termIndex}-${termLine}`">
          {{ termLine }}
        </p>
      </div>

      <div v-else class="empty-panel">
        {{ emptyValue }}
      </div>
    </details>
  </aside>
</template>
