<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';

  import type ProjectPreviewModel from '../../../core/models/project.preview.model';
  import IndexProjectPreviewParams from '../../../core/params/index.project.preview.params';
  import ProjectPreviewController from '../../controllers/project.preview.controller';

  const emit = defineEmits<{
    upcomingChange: [
      payload: {
        hasUpcoming: boolean;
        preview: ProjectPreviewModel | null;
      },
    ];
  }>();

  const controller = ProjectPreviewController.getInstance();
  const state = computed(() => controller.listState.value);

  const { t } = useI18n();
  const route = useRoute();
  const perPage = ref(10);

  const projectId = computed(() =>
    route.query.project_id ? Number(route.query.project_id) : undefined,
  );

  const projectPreviewId = computed(() =>
    route.query.project_preview_id ? Number(route.query.project_preview_id) : undefined,
  );

  const previewItems = computed<ProjectPreviewModel[]>(() => {
    const currentState = controller.listState.value as any;

    const data =
      currentState?.data?.data ??
      currentState?.data ??
      currentState?.response?.data?.data ??
      currentState?.response?.data ??
      [];

    return Array.isArray(data) ? (data as ProjectPreviewModel[]) : [];
  });

  const isPreviewUpcoming = (preview: ProjectPreviewModel): boolean => {
    const previewDate = preview.preview_date?.trim();

    if (!previewDate) return false;

    const previewTime = preview.preview_time?.trim() || '00:00:00';
    const scheduledTimestamp = new Date(`${previewDate}T${previewTime}`).getTime();

    return Number.isFinite(scheduledTimestamp) && scheduledTimestamp > Date.now();
  };

  const upcomingPreview = computed<ProjectPreviewModel | null>(() => {
    return (
      previewItems.value.filter(isPreviewUpcoming).sort((first, second) => {
        const firstTimestamp = new Date(
          `${first.preview_date}T${first.preview_time?.trim() || '00:00:00'}`,
        ).getTime();

        const secondTimestamp = new Date(
          `${second.preview_date}T${second.preview_time?.trim() || '00:00:00'}`,
        ).getTime();

        return firstTimestamp - secondTimestamp;
      })[0] ?? null
    );
  });

  const fetchProjectPreviews = async (page: number = 1): Promise<void> => {
    await controller.fetchList(
      new IndexProjectPreviewParams(
        '',
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        1,
        null,
        projectId.value,
        projectPreviewId.value,
      ),
    );
  };

  const formatVisitTitle = (index: number): string => {
    return t('ProjectPreview.visit_title', {
      number: index + 1,
    });
  };

  const formatDateTime = (item: ProjectPreviewModel): string => {
    const date = item.preview_date ?? '';
    const time = item.preview_time ? item.preview_time.slice(0, 5) : '';

    return [date, time].filter(Boolean).join(' ');
  };

  const getEngineerName = (item: ProjectPreviewModel): string => {
    return item.engineer?.title ?? t('general.not_specified');
  };

  const getAddress = (item: ProjectPreviewModel): string => {
    return item.address || t('general.no_address');
  };

  watch(
    upcomingPreview,
    (preview) => {
      emit('upcomingChange', {
        hasUpcoming: Boolean(preview),
        preview,
      });
    },
    { immediate: true },
  );

  onMounted(async () => {
    await fetchProjectPreviews();
  });
</script>

<template>
  <section class="project-preview-page">
    <header class="page-header">
      <span class="page-header__icon" aria-hidden="true">
        <i class="pi pi-calendar"></i>
      </span>

      <div class="page-header__content">
        <h4>{{ $t('ProjectPreview.list_title') }}</h4>
        <p>{{ $t('ProjectPreview.list_description') }}</p>
      </div>
    </header>

    <div class="project-preview-page__body">
      <DataStatusBuilder
        :controller="state"
        :on-retry="
          async () => {
            await fetchProjectPreviews();
          }
        "
      >
        <template #success="{ data }">
          <div class="preview-cards">
            <article
              v-for="(item, index) in data as ProjectPreviewModel[]"
              :key="item.id"
              class="preview-card"
              :class="{
                'preview-card--upcoming': isPreviewUpcoming(item),
              }"
            >
              <header class="preview-card__header">
                <div class="preview-card__identity">
                  <span class="preview-card__step" aria-hidden="true">
                    {{ index + 1 }}
                  </span>

                  <h5>{{ formatVisitTitle(index) }}</h5>
                </div>

                <span class="preview-card__badge">
                  <i class="pi pi-calendar" aria-hidden="true"></i>
                  <bdi dir="ltr">{{ formatDateTime(item) }}</bdi>
                </span>
              </header>

              <div class="preview-card__content">
                <div class="preview-card__info">
                  <div class="preview-card__row preview-card__row--engineer">
                    <span class="preview-card__icon" aria-hidden="true">
                      <i class="pi pi-user"></i>
                    </span>

                    <bdi class="preview-card__value">{{ getEngineerName(item) }}</bdi>
                  </div>

                  <div class="preview-card__row preview-card__row--address">
                    <span class="preview-card__icon" aria-hidden="true">
                      <i class="pi pi-map-marker"></i>
                    </span>

                    <bdi class="preview-card__value">{{ getAddress(item) }}</bdi>
                  </div>
                </div>

                <div
                  v-if="isPreviewUpcoming(item)"
                  class="preview-card__warning"
                  role="status"
                  aria-live="polite"
                >
                  <span class="preview-card__warning-icon" aria-hidden="true">
                    <i class="pi pi-exclamation-triangle"></i>
                  </span>

                  <div class="preview-card__warning-content">
                    <strong>{{ $t('ProjectPreview.evaluation_warning_title') }}</strong>
                    <p>
                      {{
                        $t('ProjectPreview.evaluation_warning_description', {
                          date: formatDateTime(item),
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </template>

        <template #empty>
          <div class="empty-state">
            <span class="empty-state__icon" aria-hidden="true">
              <i class="pi pi-calendar"></i>
            </span>

            <h3>{{ $t('project_preview.empty_title') }}</h3>
            <p>{{ $t('project_preview.empty_description') }}</p>
          </div>
        </template>

        <template #loader>
          <div class="preview-loader" aria-busy="true">
            <TableSkelaton :rows="5" :columns="1" :has-actions="false" :show-index="false" />
          </div>
        </template>
      </DataStatusBuilder>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .project-preview-page {
    --preview-accent: var(--PrimaryColor, #c47a45);
    --preview-accent-strong: #98552f;
    --preview-accent-soft: var(--PrimaryColor-light, #fcf1e9);
    --preview-heading: var(--gray-8, #243247);
    --preview-text: var(--gray-6, #536174);
    --preview-muted: var(--gray-5, #737f90);
    --preview-border: var(--border-weak, #e8edf2);
    --preview-surface: var(--white, #ffffff);
    --preview-background: #f8fafc;

    container-name: project-previews;
    container-type: inline-size;
    display: flex;
    width: 100%;
    min-width: 0;
    flex-direction: column;
    border: 1px solid var(--preview-border);
    border-radius: 22px;
    background: var(--preview-surface);
    box-shadow: 0 6px 24px rgba(23, 35, 53, 0.035);
    color: var(--preview-text);
    text-align: start;

    &,
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
  }

  .page-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.35rem 1.5rem;
    border-bottom: 1px solid var(--preview-border);
    border-start-start-radius: 22px;
    border-start-end-radius: 22px;
    background: linear-gradient(125deg, #fffaf6 0%, var(--preview-surface) 75%);

    &__icon {
      display: grid;
      width: 50px;
      height: 50px;
      flex: 0 0 50px;
      place-items: center;
      border: 1px solid #f0dfd2;
      border-radius: 15px;
      background: var(--preview-accent-soft);
      color: var(--preview-accent);

      i {
        font-size: 1.3rem;
      }
    }

    &__content {
      min-width: 0;
    }

    h4 {
      margin: 0;
      color: var(--preview-heading);
      font-family: 'Bold', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      line-height: 1.65;
      overflow-wrap: anywhere;
    }

    p {
      margin: 0.3rem 0 0;
      color: var(--preview-muted);
      font-size: var(--sm-size, 0.85rem);
      line-height: 1.8;
      overflow-wrap: anywhere;
    }
  }

  .project-preview-page__body {
    min-width: 0;
    padding: 1.25rem;
  }

  .preview-cards {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 1rem;
  }

  .preview-card {
    min-width: 0;
    border: 1px solid var(--preview-border);
    border-radius: 16px;
    background: var(--preview-surface);
    box-shadow: 0 2px 6px rgba(23, 35, 53, 0.018);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      border-color: #d9dfe7;
      box-shadow: 0 5px 16px rgba(23, 35, 53, 0.045);
    }

    &--upcoming {
      border-color: #ecd3bf;
      box-shadow: 0 3px 14px rgba(196, 122, 69, 0.045);

      &:hover {
        border-color: var(--preview-accent);
        box-shadow: 0 5px 18px rgba(196, 122, 69, 0.075);
      }

      .preview-card__header {
        background: linear-gradient(125deg, #fff6ee 0%, #fffcfa 100%);
      }

      .preview-card__step {
        border-color: var(--preview-accent-strong);
        background: var(--preview-accent-strong);
        color: #ffffff;
      }

      .preview-card__badge {
        border-color: #eedbc9;
        background: #ffffff;
        color: #8a512d;
      }
    }
  }

  .preview-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem 1rem;
    padding: 0.95rem 1.1rem;
    border-bottom: 1px solid var(--preview-border);
    border-start-start-radius: 15px;
    border-start-end-radius: 15px;
    background: #fcfcfd;
  }

  .preview-card__identity {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.75rem;

    h5 {
      min-width: 0;
      margin: 0;
      color: var(--preview-heading);
      font-family: 'Bold', sans-serif;
      font-size: 0.98rem;
      font-weight: 700;
      line-height: 1.7;
      overflow-wrap: anywhere;
    }
  }

  .preview-card__step {
    display: grid;
    min-width: 38px;
    min-height: 38px;
    flex: 0 0 auto;
    padding: 0.3rem 0.5rem;
    place-items: center;
    border: 1px solid #f1e1d5;
    border-radius: 12px;
    background: var(--preview-accent-soft);
    color: var(--preview-accent-strong);
    font-family: 'Bold', sans-serif;
    font-size: 0.88rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.3;
  }

  .preview-card__badge {
    display: inline-flex;
    max-width: 100%;
    min-height: 34px;
    align-items: center;
    gap: 0.55rem;
    padding: 0.4rem 0.7rem;
    border: 1px solid var(--preview-border);
    border-radius: 9px;
    background: var(--preview-surface);
    color: var(--preview-text);
    font-family: 'Medium', sans-serif;
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.5;

    i {
      flex: 0 0 auto;
      color: var(--preview-accent);
      font-size: 0.88rem;
    }

    bdi {
      min-width: 0;
      overflow-wrap: anywhere;
    }
  }

  .preview-card__content {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 1.1rem 1.1rem;
  }

  .preview-card__info {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.35fr);
    align-items: start;
    gap: 0.9rem 1.25rem;
  }

  .preview-card__row {
    display: flex;
    min-width: 0;
    align-items: flex-start;
    gap: 0.7rem;
    padding-block: 0.15rem;
    color: var(--preview-text);
    font-family: 'Medium', sans-serif;
    font-size: var(--sm-size, 0.86rem);
    line-height: 1.85;

    &--engineer {
      color: var(--preview-heading);
    }
  }

  .preview-card__icon {
    display: grid;
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    place-items: center;
    border: 1px solid #edf0f4;
    border-radius: 10px;
    background: var(--preview-background);
    color: var(--preview-accent);

    i {
      font-size: 1rem;
    }
  }

  .preview-card__value {
    min-width: 0;
    padding-block: 0.25rem;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .preview-card__warning {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.95rem;
    border: 1px solid #f0ddbd;
    border-inline-start: 3px solid #d69a43;
    border-radius: 12px;
    background: #fffbf4;
    color: #805224;

    strong {
      display: block;
      font-family: 'Bold', sans-serif;
      font-size: 0.87rem;
      font-weight: 700;
      line-height: 1.75;
    }

    p {
      margin: 0.25rem 0 0;
      color: #8c6841;
      font-size: 0.8rem;
      line-height: 1.9;
    }
  }

  .preview-card__warning-icon {
    display: grid;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    place-items: center;
    border-radius: 10px;
    background: #fff0d6;
    color: #a76c23;

    i {
      font-size: 1rem;
    }
  }

  .preview-card__warning-content {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .empty-state {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 2.25rem 1.25rem;
    border: 1px dashed #dce3eb;
    border-radius: 16px;
    background: linear-gradient(180deg, #fcfdff, #f8fafc);
    text-align: center;

    &__icon {
      display: grid;
      width: 62px;
      height: 62px;
      margin-bottom: 1rem;
      place-items: center;
      border: 1px solid #f0dfd2;
      border-radius: 19px;
      background: var(--preview-accent-soft);
      color: var(--preview-accent);

      i {
        font-size: 1.55rem;
      }
    }

    h3 {
      margin: 0;
      color: var(--preview-heading);
      font-family: 'Bold', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.8;
      overflow-wrap: anywhere;
    }

    p {
      max-width: 48ch;
      margin: 0.4rem 0 0;
      color: var(--preview-muted);
      font-size: var(--sm-size, 0.85rem);
      line-height: 1.9;
      overflow-wrap: anywhere;
    }
  }

  .preview-loader {
    min-width: 0;
    overflow-x: auto;
    border: 1px solid var(--preview-border);
    border-radius: 14px;
    background: var(--preview-surface);
  }

  @container project-previews (max-width: 640px) {
    .page-header {
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;

      &__icon {
        width: 42px;
        height: 42px;
        flex-basis: 42px;
        border-radius: 12px;
      }

      h4 {
        font-size: 1rem;
      }
    }

    .project-preview-page__body {
      padding: 0.85rem;
    }

    .preview-card__header {
      align-items: flex-start;
      flex-direction: column;
      padding: 0.85rem;
    }

    .preview-card__content {
      padding: 0.85rem;
    }

    .preview-card__info {
      grid-template-columns: minmax(0, 1fr);
      gap: 0.55rem;
    }

    .preview-card__warning {
      gap: 0.6rem;
      padding: 0.75rem;
    }
  }

  @media (max-width: 640px) {
    .project-preview-page {
      border-radius: 18px;
    }

    .page-header {
      padding: 1rem;
      border-start-start-radius: 18px;
      border-start-end-radius: 18px;
    }

    .project-preview-page__body {
      padding: 0.85rem;
    }

    .preview-card__header {
      align-items: flex-start;
      flex-direction: column;
    }

    .preview-card__info {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .preview-card {
      transition: none;
    }
  }
</style>