<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

  import ShowProjectFloorParams from '../../core/params/show.project.floor.params';
  import ProjectFloorController from '../controllers/project.floor.controller';
  import type ProjectFloorShowModel from '../../core/models/project.floor.show.model';
  import CustomAccordion from '@/shared/Accordion/CustomAccordion.vue';

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
   * قراءة project_preview_id من الـ query.
   * نحتفظ به لو احتجناه في الصفحة أو في إضافة Floor جديد.
   */
  const projectPreviewId = computed<number>(() => {
    const value = Number(route.query.project_preview_id);

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
          | ProjectFloorShowModel
          | ProjectFloorShowModel[]
          | null
          | undefined;

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
  <div class="ProjectFloor-crud-page">
    <section v-if="loading" class="show-card loading-state">
      {{ $t('loading') }}
    </section>

    <section v-else-if="projectFloorList.length" class="show-card">
      <CustomAccordion
        :items="projectFloorList"
        :default-value="['0']"
        :multiple="true"
        accordion-content-class="show-accordion-content"
      >
        <template #header="{ item: floor }">
          <div class="show-header">
            <div>
              <span class="eyebrow"> Floor Reference </span>

              <h3>
                {{ getFloorTitle(floor) }}
              </h3>

              <p>
                {{ floor.project?.title ?? '-' }}
              </p>
            </div>

            <div class="show-id">#{{ floor.id }}</div>
          </div>
        </template>

        <template #content="{ item: floor }">
          <div class="show-card-content">
            <div class="info-grid">
              <div class="info-item">
                <span>
                  {{ $t('Project.project') }}
                </span>

                <strong>
                  {{ floor.project?.title ?? '-' }}
                </strong>
              </div>

              <div class="info-item">
                <span>
                  {{ $t('Project.floor') }}
                </span>

                <strong>
                  {{ getFloorTitle(floor) }}
                </strong>
              </div>

              <div class="info-item">
                <span>
                  {{ $t('Project.engineer') }}
                </span>

                <strong>
                  {{ floor.project_preview?.engineer?.title ?? '-' }}
                </strong>
              </div>

              <div class="info-item">
                <span>
                  {{ $t('Project.preview_date') }}
                </span>

                <strong>
                  {{ floor.project_preview?.preview_date ?? '-' }}
                </strong>
              </div>

              <div class="info-item">
                <span>
                  {{ $t('Project.preview_time') }}
                </span>

                <strong>
                  {{ floor.project_preview?.preview_time ?? '-' }}
                </strong>
              </div>

              <div class="info-item">
                <span>
                  {{ $t('Project.created_at') }}
                </span>

                <strong>
                  {{ floor.created_at ?? '-' }}
                </strong>
              </div>

              <div class="info-item">
                <span> Project ID </span>

                <strong>
                  {{ projectId || floor.project?.id || '-' }}
                </strong>
              </div>

              <div class="info-item">
                <span> Project Preview ID </span>

                <strong>
                  {{ projectPreviewId || floor.project_preview?.id || '-' }}
                </strong>
              </div>
            </div>

            <div class="notes-grid">
              <div class="note-card">
                <span>
                  {{ $t('Project.site_description') }}
                </span>

                <p>
                  {{ floor.site_description || '-' }}
                </p>
              </div>

              <div class="note-card">
                <span>
                  {{ $t('Project.technical_general_notes') }}
                </span>

                <p>
                  {{ floor.technical_general_notes || '-' }}
                </p>
              </div>

              <div class="note-card">
                <span>
                  {{ $t('Project.inspection_recommendations') }}
                </span>

                <p>
                  {{ floor.inspection_recommendations || '-' }}
                </p>
              </div>
            </div>

            <section class="spaces-section">
              <div class="spaces-header">
                <div>
                  <h4>
                    {{ $t('Project.spaces') }}
                  </h4>

                  <p>
                    {{ $t('Project.spaces_description') }}
                  </p>
                </div>

                <span>
                  {{ floor.spaces?.length ?? 0 }}
                </span>
              </div>

              <div v-if="!floor.spaces?.length" class="empty-state">
                {{ $t('Project.no_spaces_registered') }}
              </div>

              <div v-else class="spaces-list">
                <article
                  v-for="(spaceItem, index) in floor.spaces"
                  :key="spaceItem.id ?? index"
                  class="space-row"
                >
                  <div class="space-index">
                    {{ index + 1 }}
                  </div>

                  <div class="space-name">
                    <span>
                      {{ $t('ProjectFloor.space') }}
                    </span>

                    <strong>
                      {{ spaceItem.space?.title ?? '-' }}
                    </strong>
                  </div>

                  <div class="metric">
                    <span>
                      {{ $t('Project.length') }}
                    </span>

                    <strong>
                      {{ spaceItem.length || '0' }}
                    </strong>
                  </div>

                  <div class="metric">
                    <span>
                      {{ $t('Project.width') }}
                    </span>

                    <strong>
                      {{ spaceItem.width || '0' }}
                    </strong>
                  </div>

                  <div class="metric">
                    <span>
                      {{ $t('Project.height') }}
                    </span>

                    <strong>
                      {{ spaceItem.height || '0' }}
                    </strong>
                  </div>

                  <div class="space-notes">
                    <span>
                      {{ $t('Project.notes') }}
                    </span>

                    <strong>
                      {{ spaceItem.notes || '-' }}
                    </strong>
                  </div>

                  <div class="attachments">
                    <span>
                      {{ $t('Project.attachments') }}
                    </span>

                    <div v-if="!spaceItem.attachments?.length" class="empty-attachment">-</div>

                    <div v-else class="attachment-list">
                      <a
                        v-for="attachment in spaceItem.attachments"
                        :key="attachment.id ?? attachment.file"
                        :href="attachment.file"
                        target="_blank"
                        rel="noopener"
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
          </div>
        </template>
      </CustomAccordion>
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

  .loading-state {
    min-height: 160px;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-family: 'Medium';
  }

  .show-card-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .show-accordion-content {
    padding: 1.25rem;
    background: transparent !important;
    color: inherit;
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
    grid-template-columns: repeat(4, minmax(0, 1fr));
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
      font-size: var(--sm-size);
      line-height: 1.8;
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
      42px
      minmax(160px, 1.2fr)
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
    background: #fff;
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
    background: #fff;
    color: var(--PrimaryColor);
    font-family: 'Bold';
    font-size: 0.75rem;
  }

  .empty-state {
    display: grid;
    min-height: 100px;
    place-items: center;
    color: #94a3b8;
    font-family: 'Medium';
    text-align: center;
  }

  .empty-attachment {
    color: #94a3b8;
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
  }

  @media (max-width: 1200px) {
    .info-grid,
    .notes-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .space-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
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
