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
  <div class="project-preview-page">
    <header class="page-header">
      <div>
        <h4>{{ $t('ProjectPreview.list_title') }}</h4>
        <p>{{ $t('ProjectPreview.list_description') }}</p>
      </div>
    </header>

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
            <div class="preview-card__side">
              <span class="preview-card__step">{{ index + 1 }}</span>
            </div>

            <div class="preview-card__content">
              <div class="preview-card__header">
                <h5>{{ formatVisitTitle(index) }}</h5>

                <span class="preview-card__badge">
                  {{ formatDateTime(item) }}
                </span>
              </div>

              <div class="preview-card__info">
                <div class="preview-card__row">
                  <span class="preview-card__icon">👷</span>
                  <span>{{ getEngineerName(item) }}</span>
                </div>

                <div class="preview-card__row">
                  <span class="preview-card__icon">📍</span>
                  <span>{{ getAddress(item) }}</span>
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

                <div>
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
          <h3>{{ $t('project_preview.empty_title') }}</h3>
          <p>{{ $t('project_preview.empty_description') }}</p>
        </div>
      </template>

      <template #loader>
        <TableSkelaton :rows="5" :columns="1" :has-actions="false" :show-index="false" />
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .project-preview-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    h4 {
      margin: 0;
      color: var(--gray-8);
      font-family: 'Bold';
    }

    p {
      margin: 0.35rem 0 0;
      color: var(--gray-5);
      font-size: var(--sm-size);
    }
  }

  .preview-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .preview-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--border-weak);
    border-radius: 18px;
    background: linear-gradient(135deg, var(--white), var(--bg-section, #fafafa));
    transition: all 0.25s ease;

    &:hover {
      border-color: var(--PrimaryColor);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
      transform: translateY(-2px);
    }
  }

  .preview-card--upcoming {
    border-color: rgba(245, 158, 11, 0.38);
    box-shadow: 0 10px 30px rgba(245, 158, 11, 0.08);
  }

  .preview-card__side {
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  .preview-card__step {
    display: inline-flex;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-family: 'Bold';
    font-size: 1rem;
  }

  .preview-card__content {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 0.85rem;
  }

  .preview-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    h5 {
      margin: 0;
      color: var(--gray-8);
      font-family: 'Bold';
      font-size: 1rem;
    }
  }

  .preview-card__badge {
    display: inline-flex;
    align-items: center;
    padding: 0.4rem 0.75rem;
    border-radius: 999px;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-family: 'Medium';
    font-size: 0.82rem;
    white-space: nowrap;
  }

  .preview-card__info {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .preview-card__row {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    color: var(--gray-6);
    font-family: 'Medium';
    font-size: var(--sm-size);
  }

  .preview-card__icon {
    display: inline-flex;
    width: 26px;
    height: 26px;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-weak);
    border-radius: 50%;
    background: var(--white);
    font-size: 0.78rem;
  }

  .preview-card__warning {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.85rem 0.95rem;
    border: 1px solid rgba(245, 158, 11, 0.34);
    border-radius: 14px;
    background: linear-gradient(135deg, #fffbeb, #fff7ed);
    color: #92400e;

    strong {
      display: block;
      font-family: 'Bold';
      font-size: 0.9rem;
    }

    p {
      margin: 0.2rem 0 0;
      color: inherit;
      font-size: 0.8rem;
      line-height: 1.55;
    }
  }

  .preview-card__warning-icon {
    display: grid;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border-radius: 10px;
    background: rgba(245, 158, 11, 0.18);
    color: #92400e;
    place-items: center;
  }

  .empty-state {
    padding: 2rem;
    border: 1px dashed var(--border-weak);
    border-radius: 16px;
    color: var(--gray-5);
    text-align: center;

    h3 {
      margin: 0;
    }

    p {
      margin: 0.4rem 0 0;
    }
  }

  @media (max-width: 768px) {
    .preview-card {
      padding: 0.85rem;
    }

    .preview-card__header {
      align-items: flex-start;
      flex-direction: column;
    }

    .preview-card__badge {
      white-space: normal;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .preview-card {
      transition: none;
    }
  }
</style>
