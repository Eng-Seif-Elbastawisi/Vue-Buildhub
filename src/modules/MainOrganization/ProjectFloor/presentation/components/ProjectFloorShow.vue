<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

  import ShowProjectFloorParams from '../../core/params/show.project.floor.params';
  import ProjectFloorController from '../controllers/project.floor.controller';
  import type ProjectFloorShowModel from '../../core/models/project.floor.show.model';

  const controller = ProjectFloorController.getInstance();
  const route = useRoute();
  const { t } = useI18n();

  const loading = ref(false);
  const projectFloor = ref<ProjectFloorShowModel | null>(null);

  const projectFloorId = computed(() => {
    const value = Number(
      route.params.project_floor_id || route.query.project_floor_id || route.query.project_item,
    );

    return Number.isNaN(value) ? 0 : value;
  });

  const floorTitle = computed(() => {
    const floorNumber = projectFloor.value?.floor_number;

    const floors: Record<number, string> = {
      [-1]: 'project_floor.basement',
      [0]: 'project_floor.ground_floor',
      [1]: 'project_floor.first_floor',
      [2]: 'project_floor.second_floor',
      [3]: 'project_floor.third_floor',
      [4]: 'project_floor.fourth_floor',
      [5]: 'project_floor.fifth_floor',
      [6]: 'project_floor.sixth_floor',
      [7]: 'project_floor.seventh_floor',
      [8]: 'project_floor.eighth_floor',
      [9]: 'project_floor.ninth_floor',
      [10]: 'project_floor.tenth_floor',
    };

    if (floorNumber === undefined || floorNumber === null) return '-';

    const floorKey = floors[Number(floorNumber)];

    return floorKey ? t(floorKey) : String(floorNumber);
  });

  const fetchProjectFloor = async () => {
    if (!projectFloorId.value) return;

    loading.value = true;

    try {
      const result = await controller.fetchOne(
        new ShowProjectFloorParams({ project_floor_id: projectFloorId.value }),
      );

      if (result instanceof DataSuccess) {
        projectFloor.value = result.data as ProjectFloorShowModel;
      }
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await fetchProjectFloor();
  });
</script>

<template>
  <div class="ProjectFloor-crud-page">
    <section v-if="loading" class="show-card">{{ $t('loading') }}</section>

    <section v-else-if="projectFloor" class="show-card">
      <header class="show-header">
        <div>
          <span class="eyebrow">{{ $t('floor_reference') }}</span>
          <h3>{{ floorTitle }}</h3>
          <p>{{ projectFloor.project?.title }}</p>
        </div>

        <div class="show-id">#{{ projectFloor.id }}</div>
      </header>

      <div class="info-grid">
        <div class="info-item">
          <span>{{ $t('Project.project') }}</span>
          <strong>{{ projectFloor.project?.title ?? '-' }}</strong>
        </div>

        <div class="info-item">
          <span>{{ $t('Project.floor') }}</span>
          <strong>{{ floorTitle }}</strong>
        </div>

        <div class="info-item">
          <span>{{ $t('Project.engineer') }}</span>
          <strong>{{ projectFloor.project_preview?.engineer?.title ?? '-' }}</strong>
        </div>

        <div class="info-item">
          <span>{{ $t('Project.preview_date') }}</span>
          <strong>{{ projectFloor.project_preview?.preview_date ?? '-' }}</strong>
        </div>

        <div class="info-item">
          <span>{{ $t('Project.preview_time') }}</span>
          <strong>{{ projectFloor.project_preview?.preview_time ?? '-' }}</strong>
        </div>

        <div class="info-item">
          <span>{{ $t('Project.created_at') }}</span>
          <strong>{{ projectFloor.created_at ?? '-' }}</strong>
        </div>
      </div>

      <div class="notes-grid">
        <div class="note-card">
          <span>{{ $t('Project.site_description') }}</span>
          <p>{{ projectFloor.site_description || '-' }}</p>
        </div>

        <div class="note-card">
          <span>{{ $t('Project.technical_general_notes') }}</span>
          <p>{{ projectFloor.technical_general_notes || '-' }}</p>
        </div>

        <div class="note-card">
          <span>{{ $t('Project.inspection_recommendations') }}</span>
          <p>{{ projectFloor.inspection_recommendations || '-' }}</p>
        </div>
      </div>

      <section class="spaces-section">
        <div class="spaces-header">
          <div>
            <h4>{{ $t('Project.spaces') }}</h4>
            <p>{{ $t('Project.spaces_description') }}</p>
          </div>

          <span>{{ projectFloor.spaces.length }}</span>
        </div>

        <div v-if="!projectFloor.spaces.length" class="empty-state">
          {{ $t('Project.no_spaces_registered') }}
        </div>

        <div v-else class="spaces-list">
          <article
            v-for="(spaceItem, index) in projectFloor.spaces"
            :key="spaceItem.id ?? index"
            class="space-row"
          >
            <div class="space-index">
              {{ index + 1 }}
            </div>

            <div class="space-name">
              <strong>{{ spaceItem.space?.title ?? '-' }}</strong>
            </div>

            <div class="metric">
              <span>{{ $t('Project.length') }}</span>
              <strong>{{ spaceItem.length || '0' }}</strong>
            </div>

            <div class="metric">
              <span>{{ $t('Project.width') }}</span>
              <strong>{{ spaceItem.width || '0' }}</strong>
            </div>

            <div class="metric">
              <span>{{ $t('Project.height') }}</span>
              <strong>{{ spaceItem.height || '0' }}</strong>
            </div>

            <div class="space-notes">
              <span>{{ $t('Project.notes') }}</span>
              <strong>{{ spaceItem.notes || '-' }}</strong>
            </div>

            <div class="attachments">
              <span>{{ $t('Project.attachments') }}</span>

              <div v-if="!spaceItem.attachments.length" class="empty-attachment">-</div>

              <div v-else class="attachment-list">
                <a
                  v-for="attachment in spaceItem.attachments"
                  :key="attachment.id ?? attachment.file"
                  :href="attachment.file"
                  target="_blank"
                  class="attachment-card"
                >
                  <span class="attachment-card__icon"> 📎 </span>

                  <span class="attachment-card__content">
                    <strong>
                      {{ attachment.alt || $t('Project.view_file') }}
                    </strong>

                    <small v-if="attachment.file_size">
                      {{ attachment.file_size }}
                    </small>
                  </span>

                  <span class="attachment-card__action"> ↗ </span>
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section v-else class="show-card empty-state">
      {{ $t('Project.no_data_for_this_floor') }}
    </section>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .ProjectFloor-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .show-card {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 26px;
    background:
      radial-gradient(circle at top right, rgba(160, 98, 39, 0.08), transparent 32%), #fff;
    box-shadow: 0 14px 35px rgba(15, 23, 42, 0.045);
  }

  .show-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;

    h3 {
      margin: 0.35rem 0 0;
      color: #111827;
      font-family: 'Bold';
      font-size: 1.15rem;
    }

    p {
      margin: 0.35rem 0 0;
      color: #64748b;
      font-size: var(--sm-size);
      line-height: 1.7;
    }
  }

  .eyebrow {
    display: inline-flex;
    width: fit-content;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-family: 'Medium';
    font-size: var(--xs-size);
  }

  .show-id {
    display: inline-flex;
    min-width: 54px;
    height: 54px;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    background: #111827;
    color: #fff;
    font-family: 'Bold';
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.85rem;
  }

  .info-item,
  .note-card {
    padding: 0.9rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 18px;
    background: #fbfbfb;

    span {
      display: block;
      color: #64748b;
      font-family: 'Medium';
      font-size: var(--xs-size);
    }

    strong {
      display: block;
      margin-top: 0.3rem;
      color: #111827;
      font-family: 'Bold';
      font-size: var(--sm-size);
    }

    p {
      margin: 0.4rem 0 0;
      color: #475569;
      line-height: 1.8;
      font-size: var(--sm-size);
    }
  }

  .notes-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
  }

  .spaces-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .spaces-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h4 {
      margin: 0;
      color: #111827;
      font-family: 'Bold';
    }

    p {
      margin: 0.25rem 0 0;
      color: #64748b;
      font-size: var(--xs-size);
    }

    span {
      display: inline-flex;
      min-width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: var(--PrimaryColor-light);
      color: var(--PrimaryColor);
      font-family: 'Bold';
    }
  }

  .spaces-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .space-row {
    display: grid;
    grid-template-columns:
      42px minmax(160px, 1.2fr)
      repeat(3, minmax(80px, 0.6fr))
      minmax(160px, 1fr)
      minmax(160px, 1fr);
    gap: 0.75rem;
    align-items: center;
    padding: 0.85rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 20px;
    background: linear-gradient(135deg, #fff, #fbfbfb);
  }

  .space-index {
    display: inline-flex;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-family: 'Bold';
  }

  .space-name,
  .metric,
  .space-notes,
  .attachments {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.25rem;

    span {
      color: #94a3b8;
      font-family: 'Medium';
      font-size: var(--xs-size);
    }

    strong {
      color: #334155;
      font-family: 'Medium';
      font-size: var(--sm-size);
      line-height: 1.6;
    }
  }

  .attachment-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .attachment-card {
    display: inline-flex;
    max-width: 200px;
    min-height: 52px;
    align-items: center;
    gap: 0.65rem;
    // padding: 0.55rem 0.7rem;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 16px;
    background: linear-gradient(135deg, #ffffff, #f8fafc);
    color: #111827;
    text-decoration: none;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
    transition: all 0.22s ease;
  }

  .attachment-card:hover {
    transform: translateY(-2px);
    border-color: var(--PrimaryColor);
    background: var(--PrimaryColor-light);
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  }

  .attachment-card__icon {
    display: inline-flex;
    width: 34px;
    min-width: 34px;
    height: 34px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: #ffffff;
    color: var(--PrimaryColor);
    font-size: 1rem;
  }

  .attachment-card__content {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 0.15rem;
  }

  .attachment-card__content strong {
    max-width: 135px;
    overflow: hidden;
    color: #111827;
    font-family: 'Bold';
    font-size: var(--xs-size);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .attachment-card__content small {
    color: #64748b;
    font-family: 'Medium';
    font-size: 0.7rem;
  }

  .attachment-card__action {
    display: inline-flex;
    width: 26px;
    min-width: 26px;
    height: 26px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: #ffffff;
    color: var(--PrimaryColor);
    font-family: 'Bold';
    font-size: 0.75rem;
  }

  .empty-attachment {
    color: #94a3b8;
  }

  .error {
    color: var(--danger-dark);
  }

  @media (max-width: 1200px) {
    .info-grid,
    .notes-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .space-row {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .show-header {
      flex-direction: column;
    }

    .show-id {
      width: 100%;
    }

    .info-grid,
    .notes-grid,
    .space-row {
      grid-template-columns: 1fr;
    }
  }
</style>
