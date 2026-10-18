<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

  import ShowProjectFloorParams from '../../core/params/show.project.floor.params';
  import ProjectFloorController from '../controllers/project.floor.controller';
  import type ProjectFloorShowModel from '../../core/models/project.floor.show.model';
  import CustomAccordion from '@/shared/Accordion/CustomAccordion.vue';
  import {
    attachmentGallery,
    toGalleryAttachment,
  } from '@/shared/AttachmentGallery/attachmentGallery';

  const controller = ProjectFloorController.getInstance();
  const route = useRoute();

  const loading = ref(false);
  const projectFloorList = ref<ProjectFloorShowModel[]>([]);

  /**
   * قراءة project_id من:
   * /project_floor/add?project_id=27
   */
  const projectId = computed<number>(() => {
    const value = Number(route.query.project_id);

    return Number.isFinite(value) && value > 0 ? value : 0;
  });

  /**
   * دعم project_floor_id أيضًا لو الصفحة فتحت لعرض Floor محدد.
   */
  const projectFloorId = computed<number>(() => {
    const value = Number(
      route.params.project_floor_id ?? route.query.project_floor_id ?? route.query.project_item,
    );

    return Number.isFinite(value) && value > 0 ? value : 0;
  });

  const getFloorTitle = (item?: ProjectFloorShowModel | null) => {
    const floorNumber = item?.floor_number;

    const floors: Record<number, string> = {
      [-1]: 'Basement',
      [0]: 'Ground Floor',
      [1]: 'First Floor',
      [2]: 'Second Floor',
      [3]: 'Third Floor',
      [4]: 'Fourth Floor',
      [5]: 'Fifth Floor',
      [6]: 'Sixth Floor',
      [7]: 'Seventh Floor',
      [8]: 'Eighth Floor',
      [9]: 'Ninth Floor',
      [10]: 'Tenth Floor',
    };

    if (floorNumber === undefined || floorNumber === null) {
      return '-';
    }

    return floors[Number(floorNumber)] ?? String(floorNumber);
  };

  const getDisplayIndex = (index: string | number) => Number(index) + 1;

  const fetchProjectFloors = async () => {
    /**
     * يجب أن يوجد project_id أو project_floor_id
     * لكي يتم إرسال الطلب.
     */
    if (!projectId.value && !projectFloorId.value) {
      projectFloorList.value = [];
      return;
    }

    loading.value = true;

    try {
      const params = new ShowProjectFloorParams({
        project_id: projectId.value || undefined,
        project_floor_id: projectFloorId.value || undefined,
        allLocales: true,
      });

      const result = await controller.fetchList(params);

      if (result instanceof DataSuccess) {
        const data = result.data as
          ProjectFloorShowModel | ProjectFloorShowModel[] | null | undefined;

        projectFloorList.value = Array.isArray(data) ? data : data ? [data] : [];
      } else {
        projectFloorList.value = [];
      }
    } catch (error) {
      console.error('Failed to fetch project floors:', error);
      projectFloorList.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * إعادة تحميل البيانات عند تغير project_id في الـ URL.
   */
  watch(
    [projectId, projectFloorId],
    async ([newProjectId, newProjectFloorId], [oldProjectId, oldProjectFloorId]) => {
      if (newProjectId !== oldProjectId || newProjectFloorId !== oldProjectFloorId) {
        await fetchProjectFloors();
      }
    },
  );

  onMounted(async () => {
    await fetchProjectFloors();
  });
</script>

<template>
  <StandardFormLayout mode="show" class="ProjectFloor-crud-page">
    <section
      v-if="loading"
      class="show-card loading-state"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="loading-state__heading">
        <span class="loading-state__spinner" aria-hidden="true"></span>
        <span>{{ $t('loading') }}</span>
      </div>
      <div class="loading-state__skeleton" aria-hidden="true">
        <div class="skeleton skeleton--heading"></div>
        <div class="skeleton-grid">
          <div v-for="index in 6" :key="index" class="skeleton skeleton--tile"></div>
        </div>
        <div class="skeleton skeleton--row"></div>
      </div>
    </section>

    <section v-else-if="projectFloorList.length" class="show-card show-card--floors">
      <CustomAccordion
        class="floor-accordion"
        :items="projectFloorList"
        :default-value="['0']"
        :multiple="true"
        accordion-content-class="show-accordion-content"
      >
        <template #header="{ item: floor }">
          <div class="show-header">
            <div class="show-header__identity">
              <span class="show-header__icon" aria-hidden="true">
                <svg
                  class="floor-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                  <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
                </svg>
              </span>
              <div class="show-header__copy">
                <span class="eyebrow">{{ $t('floor_reference') }}</span>
                <h3>
                  <bdi>{{ getFloorTitle(floor) }}</bdi>
                </h3>
                <p>
                  <svg
                    class="floor-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M4 21V7l8-4v18M12 9h8v12M2 21h20M8 8v1m0 3v1m0 3v1m8-5v1m0 3v1" />
                  </svg>
                  <bdi>{{ floor.project?.title ?? '-' }}</bdi>
                </p>
              </div>
            </div>
            <div class="show-header__meta">
              <span class="show-id"
                ><bdi dir="ltr">#{{ floor.id }}</bdi></span
              >
              <span class="show-header__count">
                <span>{{ $t('Project.spaces') }}</span>
                <strong>{{ floor.spaces?.length ?? 0 }}</strong>
              </span>
            </div>
          </div>
        </template>

        <template #content="{ item: floor }">
          <div class="show-card-content">
            <dl class="info-grid">
              <div class="info-item">
                <dt class="info-item__label">
                  <svg
                    class="floor-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M4 21V7l8-4v18M12 9h8v12M2 21h20M8 8v1m0 3v1m0 3v1m8-5v1m0 3v1" />
                  </svg>
                  <span>{{ $t('Project.project') }}</span>
                </dt>
                <dd class="info-item__value">
                  <bdi>{{ floor.project?.title ?? '-' }}</bdi>
                </dd>
              </div>

              <div class="info-item">
                <dt class="info-item__label">
                  <svg
                    class="floor-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                    <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
                  </svg>
                  <span>{{ $t('Project.floor') }}</span>
                </dt>
                <dd class="info-item__value">
                  <bdi>{{ getFloorTitle(floor) }}</bdi>
                </dd>
              </div>

              <div class="info-item">
                <dt class="info-item__label">
                  <svg
                    class="floor-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                  </svg>
                  <span>{{ $t('Project.engineer') }}</span>
                </dt>
                <dd class="info-item__value">
                  <bdi>{{ floor.project_preview?.engineer?.title ?? '-' }}</bdi>
                </dd>
              </div>

              <div class="info-item">
                <dt class="info-item__label">
                  <svg
                    class="floor-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="3" />
                    <path d="M7 3v4m10-4v4M3 11h18M8 15h2m4 0h2m-8 3h2" />
                  </svg>
                  <span>{{ $t('Project.preview_date') }}</span>
                </dt>
                <dd class="info-item__value">
                  <bdi dir="ltr">{{ floor.project_preview?.preview_date ?? '-' }}</bdi>
                </dd>
              </div>

              <div class="info-item">
                <dt class="info-item__label">
                  <svg
                    class="floor-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <span>{{ $t('Project.preview_time') }}</span>
                </dt>
                <dd class="info-item__value">
                  <bdi dir="ltr">{{ floor.project_preview?.preview_time ?? '-' }}</bdi>
                </dd>
              </div>

              <div class="info-item">
                <dt class="info-item__label">
                  <svg
                    class="floor-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
                    <path d="M14 3v6h6M8 13h8m-8 4h5" />
                  </svg>
                  <span>{{ $t('Project.created_at') }}</span>
                </dt>
                <dd class="info-item__value">
                  <bdi dir="ltr">{{ floor.created_at ?? '-' }}</bdi>
                </dd>
              </div>

              <!-- <div class="info-item">
              <span>{{ $t('project_id') }}</span>

              <strong>
              {{ projectId || floor.project?.id || '-' }}
              </strong>
              </div>

              <div class="info-item">
              <span>{{ $t('project_preview_id') }}</span>

              <strong>
              {{ projectPreviewId || floor.project_preview?.id || '-' }}
              </strong>
              </div> -->
            </dl>

            <dl class="notes-grid">
              <div class="note-card">
                <dt class="note-card__label">
                  <svg
                    class="floor-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  <span>{{ $t('Project.site_description') }}</span>
                </dt>
                <dd class="note-card__value">{{ floor.site_description || '-' }}</dd>
              </div>

              <div class="note-card">
                <dt class="note-card__label">
                  <svg
                    class="floor-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
                    />
                    <rect x="8" y="3" width="8" height="4" rx="1" />
                    <path d="M8 11h8m-8 4h5" />
                  </svg>
                  <span>{{ $t('Project.technical_general_notes') }}</span>
                </dt>
                <dd class="note-card__value">{{ floor.technical_general_notes || '-' }}</dd>
              </div>

              <div class="note-card">
                <dt class="note-card__label">
                  <svg
                    class="floor-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <rect x="4" y="3" width="16" height="18" rx="3" />
                    <path d="m8 12 3 3 5-6" />
                  </svg>
                  <span>{{ $t('Project.inspection_recommendations') }}</span>
                </dt>
                <dd class="note-card__value">{{ floor.inspection_recommendations || '-' }}</dd>
              </div>
            </dl>

            <section class="spaces-section">
              <header class="spaces-header">
                <div class="spaces-header__identity">
                  <span class="spaces-header__icon" aria-hidden="true"
                    ><svg
                      class="floor-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <path d="M3 10h7V3m0 7v4m0 4v3m0-7h11" /></svg
                  ></span>
                  <div class="spaces-header__copy">
                    <h4>{{ $t('Project.spaces') }}</h4>
                    <p>{{ $t('Project.spaces_description') }}</p>
                  </div>
                </div>
                <span class="spaces-count">{{ floor.spaces?.length ?? 0 }}</span>
              </header>

              <div
                v-if="!floor.spaces?.length"
                class="empty-state empty-state--spaces"
                role="status"
              >
                <span class="empty-state__icon" aria-hidden="true"
                  ><svg
                    class="floor-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M3 10h7V3m0 7v4m0 4v3m0-7h11" /></svg
                ></span>
                <p>{{ $t('Project.no_spaces_registered') }}</p>
              </div>

              <div v-else class="spaces-list">
                <article
                  v-for="(spaceItem, index) in floor.spaces"
                  :key="spaceItem.id ?? index"
                  class="space-row"
                >
                  <div class="space-row__identity">
                    <span class="space-index">{{ getDisplayIndex(index) }}</span>
                    <div class="space-name">
                      <span class="field-label">{{ $t('ProjectFloor.space') }}</span>
                      <h5>
                        <bdi>{{ spaceItem.space?.title ?? '-' }}</bdi>
                      </h5>
                    </div>
                  </div>

                  <dl class="space-metrics">
                    <div class="metric">
                      <dt class="field-label">{{ $t('Project.length') }}</dt>
                      <dd>
                        <bdi dir="ltr">{{ spaceItem.length || '0' }}</bdi>
                      </dd>
                    </div>
                    <div class="metric">
                      <dt class="field-label">{{ $t('Project.width') }}</dt>
                      <dd>
                        <bdi dir="ltr">{{ spaceItem.width || '0' }}</bdi>
                      </dd>
                    </div>
                    <div class="metric">
                      <dt class="field-label">{{ $t('Project.height') }}</dt>
                      <dd>
                        <bdi dir="ltr">{{ spaceItem.height || '0' }}</bdi>
                      </dd>
                    </div>
                  </dl>

                  <div class="space-notes">
                    <span class="field-label">{{ $t('Project.notes') }}</span>
                    <p>{{ spaceItem.notes || '-' }}</p>
                  </div>

                  <div
                    class="attachments"
                    :class="{ 'attachments--empty': !spaceItem.attachments?.length }"
                  >
                    <span class="field-label">{{ $t('Project.attachments') }}</span>
                    <div v-if="!spaceItem.attachments?.length" class="empty-attachment">-</div>
                    <div v-else class="attachment-list">
                      <button
                        v-for="(attachment, attachmentIndex) in spaceItem.attachments"
                        :key="attachment.id ?? attachment.file"
                        type="button"
                        class="attachment-card"
                        :title="attachment.alt || $t('Project.view_file')"
                        @click="
                          attachmentGallery.open(
                            spaceItem.attachments.map(toGalleryAttachment),
                            Number(attachmentIndex),
                          )
                        "
                      >
                        <span class="attachment-card__icon" aria-hidden="true"
                          ><svg
                            class="floor-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path
                              d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"
                            />
                            <path d="M14 3v6h6M8 13h8m-8 4h5" /></svg
                        ></span>
                        <span class="attachment-card__content">
                          <strong
                            ><bdi>{{ attachment.alt || $t('Project.view_file') }}</bdi></strong
                          >
                          <small v-if="attachment.file_size"
                            ><bdi dir="ltr">{{ attachment.file_size }}</bdi></small
                          >
                        </span>
                        <span class="attachment-card__action" aria-hidden="true"
                          ><svg
                            class="floor-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path
                              d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"
                            /></svg
                        ></span>
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </template>
      </CustomAccordion>
    </section>

    <section v-else class="show-card empty-state" role="status">
      <span class="empty-state__icon" aria-hidden="true"
        ><svg
          class="floor-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></svg
      ></span>
      <p>{{ $t('Project.no_data_for_this_floor') }}</p>
    </section>

    <div v-if="controller.errorMessage.value" class="error" role="alert">
      <span class="error__icon" aria-hidden="true"
        ><svg
          class="floor-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m10.3 4-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4m0 4h.01" /></svg
      ></span>
      <p>{{ controller.errorMessage.value }}</p>
    </div>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
.ProjectFloor-crud-page {
  --floor-accent: var(--PrimaryColor, #c47a45);
  --floor-accent-dark: #94532f;
  --floor-accent-light: var(--PrimaryColor-light, #fbf0e7);
  --floor-text: var(--gray-8, #243247);
  --floor-secondary: #506075;
  --floor-muted: #687689;
  --floor-border: #e6ebf1;
  --floor-surface: var(--white, #fff);
  --floor-soft: #f8fafc;

  container-name: project-floor;
  container-type: inline-size;
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 1rem;
  color: var(--floor-text);
  text-align: start;
}

.ProjectFloor-crud-page,
.ProjectFloor-crud-page :deep(*) {
  box-sizing: border-box;
}

.floor-icon {
  display: block;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  stroke: currentColor;
  stroke-width: 1.65;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.show-card {
  min-width: 0;
  padding: 1.5rem;
  border: 1px solid var(--floor-border);
  border-radius: var(--bh-radius-card);
  background: var(--floor-surface);
  box-shadow: none;
}

.show-card--floors {
  padding: 0;
  border: 0;
  border-radius: var(--bh-radius-card);
  background: transparent;
  box-shadow: none;
}

/* Scoped integration: keep the existing accordion's state and interaction. */
.show-card--floors :deep(.p-accordion) {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1rem;
  border: 0;
  background: transparent;
}

.show-card--floors :deep(.p-accordionpanel),
.show-card--floors :deep(.p-accordion-tab) {
  min-width: 0;
  margin: 0;
  overflow: visible;
  border: 1px solid var(--floor-border);
  border-radius: var(--bh-radius-card);
  background: var(--floor-surface);
  box-shadow: none;
}

.show-card--floors :deep(.p-accordionheader),
.show-card--floors :deep(.p-accordion-header-link) {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.35rem;
  border: 0;
  border-radius: var(--bh-radius-card);
  background: var(--bh-surface);
  color: var(--floor-text);
  font: inherit;
  text-align: start;
  text-decoration: none;
  box-shadow: none;
}

.show-card--floors :deep(.p-accordionheader:hover),
.show-card--floors :deep(.p-accordion-header-link:hover) {
  background: var(--bh-surface-secondary);
}

.show-card--floors :deep(.p-accordionheader:focus-visible),
.show-card--floors :deep(.p-accordion-header-link:focus-visible) {
  outline: 2px solid var(--floor-accent);
  outline-offset: 3px;
}

.show-card--floors :deep(.p-accordionheader-toggle-icon),
.show-card--floors :deep(.p-accordion-toggle-icon) {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  color: var(--floor-accent-dark);
}

.show-card--floors :deep(.show-accordion-content),
.show-card--floors :deep(.p-accordioncontent-content),
.show-card--floors :deep(.p-accordion-content) {
  min-width: 0;
  padding: 0;
  border: 0;
  border-end-start-radius: 19px;
  border-end-end-radius: 19px;
  background: var(--floor-surface);
  color: inherit;
}

.show-header {
  display: flex;
  width: 100%;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.show-header__identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.9rem;
}

.show-header__icon {
  display: grid;
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  place-items: center;
  border: 1px solid var(--bh-line);
  border-radius: 17px;
  background: var(--floor-accent-light);
  color: var(--floor-accent);
}

.show-header__icon .floor-icon {
  width: 28px;
  height: 28px;
}

.show-header__copy {
  min-width: 0;
}

.eyebrow {
  display: block;
  color: var(--floor-accent-dark);
  font-family: 'Medium', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.6;
}

.show-header h3 {
  margin: 0.15rem 0 0;
  color: var(--floor-text);
  font-family: 'Bold', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.show-header p {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 0.4rem;
  margin: 0.2rem 0 0;
  color: var(--floor-muted);
  font-size: 0.8rem;
  font-weight: 400;
  line-height: 1.75;
}

.show-header p .floor-icon {
  width: 14px;
  height: 14px;
  margin-block-start: 0.25rem;
}

.show-header p bdi {
  min-width: 0;
  overflow-wrap: anywhere;
}

.show-header__meta {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-end;
  flex-direction: column;
  gap: 0.55rem;
}

.show-id {
  display: inline-flex;
  min-height: 31px;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.65rem;
  border: 1px solid #f0ddce;
  border-radius: 9px;
  background: var(--floor-accent-light);
  color: var(--floor-accent-dark);
  font-family: 'Bold', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.show-header__count {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--floor-muted);
  font-size: 0.74rem;
  font-weight: 400;
}

.show-header__count strong {
  color: var(--floor-text);
  font-family: 'Bold', sans-serif;
  font-variant-numeric: tabular-nums;
}

.show-card-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1.15rem;
  padding: 1.25rem;
  border-top: 1px solid var(--floor-border);
}

.info-grid,
.notes-grid {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0;
}

.info-item {
  min-width: 0;
  padding: 0.85rem 1rem;
  border: 1px solid var(--floor-border);
  border-radius: 12px;
  background: var(--floor-soft);
}

.info-item__label,
.note-card__label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0;
  color: var(--floor-muted);
  font-family: 'Medium', sans-serif;
  font-size: 0.75rem;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.info-item__label .floor-icon,
.note-card__label .floor-icon {
  width: 16px;
  height: 16px;
  margin-block-start: 0.1rem;
  color: var(--floor-accent);
}

.info-item__value {
  margin: 0.35rem 0 0;
  color: var(--floor-text);
  font-family: 'Bold', sans-serif;
  font-size: 0.87rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.note-card {
  min-width: 0;
  padding: 0.95rem 1rem;
  border: 1px solid var(--floor-border);
  border-radius: 12px;
  background: var(--floor-surface);
}

.note-card__label {
  color: var(--floor-secondary);
}

.note-card__value {
  margin: 0.55rem 0 0;
  color: var(--floor-secondary);
  font-size: 0.82rem;
  line-height: 1.95;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  unicode-bidi: plaintext;
}

.spaces-section {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.8rem;
}

.spaces-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border: 1px solid #f2e7dc;
  border-radius: 12px;
  background: var(--bh-surface);
}

.spaces-header__identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.7rem;
}

.spaces-header__icon {
  display: grid;
  width: 39px;
  height: 39px;
  flex: 0 0 39px;
  place-items: center;
  border: 1px solid #f1e2d5;
  border-radius: 11px;
  background: var(--bh-surface);
  color: var(--floor-accent);
}

.spaces-header__copy {
  min-width: 0;
}

.spaces-header h4 {
  margin: 0;
  color: var(--floor-text);
  font-family: 'Bold', sans-serif;
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.spaces-header p {
  margin: 0.1rem 0 0;
  color: var(--floor-muted);
  font-size: 0.74rem;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.spaces-count {
  display: grid;
  min-width: 34px;
  min-height: 34px;
  flex: 0 0 auto;
  padding: 0.25rem 0.55rem;
  place-items: center;
  border: 1px solid var(--bh-line);
  border-radius: 10px;
  background: var(--floor-accent-light);
  color: var(--floor-accent-dark);
  font-family: 'Bold', sans-serif;
  font-size: 0.87rem;
  font-variant-numeric: tabular-nums;
}

.spaces-list {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.7rem;
}

.space-row {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr) minmax(0, 1.35fr);
  align-items: start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--floor-border);
  border-radius: 13px;
  background: var(--floor-surface);
}

.space-row__identity {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 0.65rem;
  padding-block: 0.15rem;
}

.space-index {
  display: grid;
  min-width: 31px;
  min-height: 31px;
  flex: 0 0 auto;
  padding: 0.2rem 0.35rem;
  place-items: center;
  border: 1px solid #f4e2d4;
  border-radius: 10px;
  background: var(--floor-accent-light);
  color: var(--floor-accent-dark);
  font-family: 'Bold', sans-serif;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.space-name,
.space-notes,
.attachments {
  min-width: 0;
}

.field-label {
  display: block;
  margin: 0;
  color: var(--floor-muted);
  font-family: 'Medium', sans-serif;
  font-size: 0.73rem;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.space-name h5 {
  margin: 0.2rem 0 0;
  color: var(--floor-text);
  font-family: 'Bold', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.space-metrics {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin: 0;
  padding: 0.55rem 0;
  border: 1px solid var(--bh-canvas);
  border-radius: 10px;
  background: var(--floor-soft);
  text-align: center;
}

.metric {
  min-width: 0;
  padding: 0 0.45rem;
}

.metric + .metric {
  border-inline-start: 1px solid #e3e8ef;
}

.metric dd {
  margin: 0.3rem 0 0;
  color: var(--floor-text);
  font-family: 'Bold', sans-serif;
  font-size: 0.83rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.space-notes p {
  margin: 0.25rem 0 0;
  color: var(--floor-secondary);
  font-size: 0.8rem;
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  unicode-bidi: plaintext;
}

.attachments {
  grid-column: 1 / -1;
  padding-top: 0.85rem;
  border-top: 1px solid var(--floor-border);
}

.attachments--empty {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.empty-attachment {
  margin: 0;
  color: var(--floor-muted);
  font-size: 0.82rem;
}

.attachment-list {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.attachment-card {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--floor-border);
  border-radius: 10px;
  background: var(--bh-surface);
  color: var(--floor-text);
  font: inherit;
  text-align: start;
  cursor: pointer;
  text-decoration: none;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.attachment-card:hover {
  border-color: var(--floor-accent);
  background: var(--bh-surface-secondary);
}

.attachment-card:focus-visible {
  outline: 2px solid var(--floor-accent);
  outline-offset: 3px;
}

.attachment-card__icon {
  display: grid;
  width: 30px;
  height: 34px;
  flex: 0 0 30px;
  place-items: center;
  border: 1px solid #f1e3d8;
  border-radius: 8px;
  background: var(--bh-surface-secondary);
  color: var(--floor-accent);
}

.attachment-card__icon .floor-icon {
  width: 17px;
  height: 17px;
}

.attachment-card__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.15rem;
}

.attachment-card__content strong {
  color: var(--floor-text);
  font-family: 'Medium', sans-serif;
  font-size: 0.74rem;
  font-weight: 500;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.attachment-card__content small {
  color: var(--floor-muted);
  font-size: 0.66rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.attachment-card__action {
  flex: 0 0 auto;
  color: var(--floor-muted);
}

.attachment-card__action .floor-icon {
  width: 13px;
  height: 13px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.85rem;
  padding: 2.5rem 1.25rem;
  color: var(--floor-muted);
  text-align: center;
}

.empty-state__icon {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border: 1px solid #f0e0d4;
  border-radius: 17px;
  background: var(--floor-accent-light);
  color: var(--floor-accent);
}

.empty-state__icon .floor-icon {
  width: 26px;
  height: 26px;
}

.empty-state p {
  max-width: 48ch;
  margin: 0;
  color: var(--floor-secondary);
  font-family: 'Medium', sans-serif;
  font-size: 0.85rem;
  line-height: 1.9;
  overflow-wrap: anywhere;
}

.empty-state--spaces {
  padding: 1.6rem 1rem;
  border: 1px dashed var(--bh-line);
  border-radius: 12px;
  background: var(--floor-soft);
}

.empty-state--spaces .empty-state__icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.loading-state__heading {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--floor-secondary);
  font-family: 'Medium', sans-serif;
  font-size: 0.85rem;
}

.loading-state__spinner {
  width: 19px;
  height: 19px;
  flex: 0 0 19px;
  border: 2px solid var(--bh-line);
  border-top-color: var(--floor-accent);
  border-radius: 50%;
  animation: floor-loading-spin 0.85s linear infinite;
}

.loading-state__skeleton {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.85rem;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.skeleton {
  border-radius: 10px;
  background: linear-gradient(100deg, var(--bh-canvas) 20%, #fafbfd 50%, var(--bh-canvas) 80%);
  background-size: 200% 100%;
  animation: floor-loading-shimmer 1.8s ease-in-out infinite;
}

.skeleton--heading {
  width: 42%;
  height: 28px;
}

.skeleton--tile {
  height: 72px;
}

.skeleton--row {
  height: 90px;
}

.error {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #f3cece;
  border-radius: 13px;
  background: var(--danger-light, #fff5f5);
  color: var(--danger-dark, #a13c3c);
}

.error__icon {
  flex: 0 0 auto;
  padding-block-start: 0.15rem;
}

.error p {
  min-width: 0;
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.85;
  overflow-wrap: anywhere;
}

@keyframes floor-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes floor-loading-shimmer {
  to {
    background-position: -200% 0;
  }
}

@container project-floor (max-width: 900px) {
  .space-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem 1.25rem;
  }

  .space-notes {
    grid-column: 1 / -1;
    padding-top: 0.8rem;
    border-top: 1px solid var(--floor-border);
  }
}

@container project-floor (max-width: 680px) {
  .info-grid,
  .skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .notes-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .show-card-content {
    padding: 1rem;
  }
}

@container project-floor (max-width: 500px) {
  .show-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.7rem;
  }

  .show-header__identity {
    gap: 0.7rem;
  }

  .show-header__icon {
    width: 46px;
    height: 46px;
    flex-basis: 46px;
    border-radius: 13px;
  }

  .show-header h3 {
    font-size: 1rem;
  }

  .show-header__meta {
    width: 100%;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
  }

  .space-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.85rem;
    padding: 0.85rem;
  }

  .info-grid,
  .notes-grid {
    gap: 0.6rem;
  }

  .info-item {
    padding: 0.7rem;
  }

  .info-item__label {
    font-size: 0.7rem;
  }

  .info-item__value {
    font-size: 0.8rem;
  }

  .show-card-content {
    gap: 0.85rem;
    padding: 0.85rem;
  }

  .spaces-header {
    padding: 0.75rem;
  }
}

/* Viewport fallback also handles a full-width mobile page. */
@media (max-width: 560px) {
  .show-card--floors :deep(.p-accordionheader),
  .show-card--floors :deep(.p-accordion-header-link) {
    align-items: flex-start;
    gap: 0.65rem;
    padding: 1rem;
  }

  .info-grid,
  .skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .notes-grid,
  .space-row {
    grid-template-columns: minmax(0, 1fr);
  }
}

@container project-floor (max-width: 340px) {
  .info-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .attachment-card {
    transition: none;
  }

  .loading-state__spinner,
  .skeleton {
    animation: none;
  }
}
</style>
