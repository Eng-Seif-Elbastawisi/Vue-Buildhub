<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';

  import type ProjectPreviewModel from '../../../core/models/project.preview.model';
  import IndexProjectPreviewParams from '../../../core/params/index.project.preview.params';
  import ProjectPreviewController from '../../controllers/project.preview.controller';
  import { useI18n } from 'vue-i18n';

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

  const fetchProjectPreviews = async (page: number = 1) => {
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

  const formatVisitTitle = (index: number) => {
    return t('ProjectPreview.visit_title', {
      number: index + 1,
    });
  };
  const formatDateTime = (item: ProjectPreviewModel) => {
    const date = item.preview_date ?? '';
    const time = item.preview_time ? item.preview_time.slice(0, 5) : '';

    return [date, time].filter(Boolean).join(' ');
  };

  const getEngineerName = (item: ProjectPreviewModel) => {
    return item.engineer?.title ?? 'غير محدد';
  };

  const getAddress = (item: ProjectPreviewModel) => {
    return item.address || 'لا يوجد عنوان';
  };

  onMounted(async () => {
    await fetchProjectPreviews();
  });
</script>

<template>
  <div class="project-preview-page" dir="rtl">
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
            </div>
          </article>
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
      font-family: 'Bold';
      color: var(--gray-8);
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

  .preview-card__side {
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  .preview-card__step {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-family: 'Bold';
    font-size: 1rem;
  }

  .preview-card__content {
    flex: 1;
    min-width: 0;
    display: flex;
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
      font-family: 'Bold';
      font-size: 1rem;
      color: var(--gray-8);
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
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--white);
    border: 1px solid var(--border-weak);
    font-size: 0.78rem;
  }

  @media (max-width: 768px) {
    .preview-card {
      padding: 0.85rem;
    }

    .preview-card__header {
      flex-direction: column;
      align-items: flex-start;
    }

    .preview-card__badge {
      white-space: normal;
    }
  }
</style>
