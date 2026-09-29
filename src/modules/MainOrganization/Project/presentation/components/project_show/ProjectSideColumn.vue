```vue
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import type { RouteLocationRaw } from 'vue-router';

  import projectPreviewHouseBackground from '@/assets/images/project-preview-house-background.svg';

  import {
    ConvertStatus,
    type ConvertStatus as ConvertStatusType,
  } from '../../../core/constants/convert.status.enum';

  import type { ProjectPreview } from './projectShow.types';

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
      with_preview?: boolean;
      status: ConvertStatusType;
    }>(),
    {
      previews: () => [],
      terms: '',
      termsLabel: '',
      with_preview: false,
    },
  );

  const activePreview = ref('0');

  const displayPreviews = computed<ProjectPreview[]>(() => {
    if (props.previews.length) {
      return props.previews;
    }

    if (props.preview) {
      return [props.preview];
    }

    return [];
  });

  const activePreviewItem = computed<ProjectPreview | null>(() => {
    return (
      displayPreviews.value[Number(activePreview.value)] ??
      displayPreviews.value[0] ??
      null
    );
  });

  const safeSiteLink = computed<string | null>(() => {
    const siteLink = activePreviewItem.value?.site_link?.trim();

    if (!siteLink) {
      return null;
    }

    return /^https?:\/\/\S+$/i.test(siteLink)
      ? siteLink
      : null;
  });

  /**
   * Disable the Items/Departments section while the project is:
   *
   * 1 => WAITING_PREVIEW
   * 2 => WAITING_PREVIEW_RESULT
   */
  const itemsDisabled = computed<boolean>(() => {
    const currentStatus = Number(props.status);

    return (
      currentStatus === ConvertStatus.WAITING_PREVIEW ||
      currentStatus === ConvertStatus.WAITING_PREVIEW_RESULT
    );
  });

  const toPositiveInteger = (
    value: unknown,
  ): number | undefined => {
    const normalizedValue = Array.isArray(value)
      ? value[0]
      : value;

    const numberValue = Number(normalizedValue);

    return Number.isInteger(numberValue) && numberValue > 0
      ? numberValue
      : undefined;
  };

  const getProjectId = (): number | undefined => {
    if (
      typeof props.addItemTo !== 'object' ||
      props.addItemTo === null ||
      !('query' in props.addItemTo)
    ) {
      return undefined;
    }

    return toPositiveInteger(
      props.addItemTo.query?.project_id,
    );
  };

  const hasValidPreviewId = (
    previewItem: ProjectPreview,
  ): boolean => {
    return toPositiveInteger(previewItem.id) !== undefined;
  };

  const getEditPreviewRoute = (
    previewItem: ProjectPreview,
  ): RouteLocationRaw => {
    const projectPreviewId = toPositiveInteger(
      previewItem.id,
    );

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

  const termLines = computed<string[]>(() => {
    return props.terms
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  });
</script>

<template>
  <aside class="project-side-column">
    <details
      v-if="with_preview"
      id="project-preview"
      class="
        project-card
        preview-card
        project-section-disclosure
      "
      open
    >
      <summary class="card-title">
        <i class="pi pi-eye" />

        <h2>
          {{ previewTitle }}
        </h2>

        <i
          class="
            pi
            pi-chevron-down
            project-disclosure-chevron
          "
          aria-hidden="true"
        />
      </summary>

      <RouterLink
        v-if="!displayPreviews.length"
        class="empty-panel empty-panel--link"
        :to="addItemTo"
      >
        <i class="pi pi-plus-circle" />

        <span>
          {{ noPreviewLabel }}
        </span>
      </RouterLink>

      <div
        v-else-if="activePreviewItem"
        class="project-preview-compact"
      >
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
            v-for="(
              previewOption,
              previewIndex
            ) in displayPreviews"
            :key="previewOption.id ?? previewIndex"
            :value="previewIndex.toString()"
          >
            {{
              formatDate(
                previewOption.preview_date,
              )
            }}
          </option>
        </select>

        <div class="project-preview-date">
          <span
            class="project-preview-date__icon"
            aria-hidden="true"
          >
            <i class="pi pi-calendar-clock" />
          </span>

          <div>
            <small>
              {{ previewDateLabel }}
            </small>

            <strong>
              {{
                formatDate(
                  activePreviewItem.preview_date,
                )
              }}
            </strong>

            <span>
              <i
                class="pi pi-clock"
                aria-hidden="true"
              />

              {{ previewTimeLabel }}

              {{
                formatTime(
                  activePreviewItem.preview_time,
                )
              }}
            </span>
          </div>
        </div>

        <div class="project-preview-fields">
          <div class="project-preview-field">
            <i
              class="pi pi-link"
              aria-hidden="true"
            />

            <div>
              <small>
                {{ siteLinkLabel }}
              </small>

              <a
                v-if="safeSiteLink"
                class="
                  project-safe-value
                  project-safe-value--clamped
                "
                :href="safeSiteLink"
                :title="safeSiteLink"
                target="_blank"
                rel="noopener"
              >
                {{ safeSiteLink }}
              </a>

              <strong
                v-else
                class="
                  project-safe-value
                  project-safe-value--clamped
                "
              >
                {{
                  valueOrEmpty(
                    activePreviewItem.site_link,
                  )
                }}
              </strong>
            </div>
          </div>

          <details
            class="
              project-preview-field
              project-preview-address
            "
          >
            <summary>
              <i
                class="pi pi-map-marker"
                aria-hidden="true"
              />

              <div>
                <small>
                  {{ addressLabel }}
                </small>

                <strong
                  class="
                    project-safe-value
                    project-safe-value--clamped
                  "
                >
                  {{
                    valueOrEmpty(
                      activePreviewItem.address,
                    )
                  }}
                </strong>
              </div>
            </summary>
          </details>
        </div>

        <RouterLink
          v-if="
            hasValidPreviewId(activePreviewItem) &&
            !hasProjectFloors
          "
          class="project-preview-edit-action"
          :aria-label="
            `${$t('Edit')} ${$t(
              'Project.steps.project_preview',
            )}`
          "
          :title="
            `${$t('Edit')} ${$t(
              'Project.steps.project_preview',
            )}`
          "
          :to="
            getEditPreviewRoute(
              activePreviewItem,
            )
          "
        >
          <i
            class="pi pi-pen-to-square"
            aria-hidden="true"
          />
        </RouterLink>
      </div>
    </details>

    <!--
      Items / Departments section.

      The content inside this slot is disabled only when the
      project status is WAITING_PREVIEW or WAITING_PREVIEW_RESULT.
    -->
    <div
      class="project-items-container"
      :class="{
        'project-items-container--disabled':
          itemsDisabled,
      }"
      :aria-disabled="itemsDisabled"
    >
      <div class="project-items-content">
        <slot />
      </div>

      <div
        v-if="itemsDisabled"
        class="project-items-disabled-overlay"
        role="status"
      >
        <span class="project-items-disabled-message">
          <i
            class="pi pi-lock"
            aria-hidden="true"
          />

          {{ $t('ProjectShow.items_disabled') }}
        </span>
      </div>
    </div>

    <!-- Terms section remains enabled -->
    <details
      id="project-terms"
      class="project-terms-disclosure"
    >
      <summary class="card-title">
        <i class="pi pi-list-check" />

        <h2>
          {{ termsLabel }}
        </h2>

        <i
          class="
            pi
            pi-chevron-down
            project-disclosure-chevron
          "
          aria-hidden="true"
        />
      </summary>

      <div
        v-if="termLines.length"
        class="terms-list"
      >
        <p
          v-for="(
            termLine,
            termIndex
          ) in termLines"
          :key="`${termIndex}-${termLine}`"
        >
          {{ termLine    }}
          
        </p>
      </div>

      <div
        v-else
        class="empty-panel"
      >
        {{ emptyValue }}
      </div>
    </details>
  </aside>
</template>

<style scoped lang="scss">
  .project-items-container {
    position: relative;
    min-width: 0;
  }

  .project-items-content {
    min-width: 0;
    transition:
      opacity 0.2s ease,
      filter 0.2s ease;
  }

  .project-items-container--disabled {
    min-height: 8rem;
    overflow: hidden;
    border-radius: var(--radius-lg);
  }

  .project-items-container--disabled
    .project-items-content {
    pointer-events: none;
    user-select: none;
    opacity: 0.45;
    filter: grayscale(0.25);
  }

  .project-items-disabled-overlay {
    position: absolute;
    z-index: 5;
    inset: 0;
    display: flex;
    min-height: 8rem;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-lg);
    background: rgb(255 255 255 / 62%);
    backdrop-filter: blur(2px);
  }

  .project-items-disabled-message {
    display: inline-flex;
    max-width: calc(100% - 2rem);
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.65rem 1rem;
    border-radius: var(--radius-full);
    background: var(--warning-light);
    color: var(--warning-dark);
    font-family: 'Medium';
    font-size: var(--sm-size);
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .project-items-content {
      transition: none;
    }
  }
</style>
```
