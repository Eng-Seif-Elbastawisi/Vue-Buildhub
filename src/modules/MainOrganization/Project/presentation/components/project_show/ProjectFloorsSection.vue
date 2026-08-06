<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import type { RouteLocationRaw } from 'vue-router';

  import {
    ConvertStatus,
    type ConvertStatus as ConvertStatusType,
  } from '../../../core/constants/convert.status.enum';

  import type { FloorSpace, ProjectFloor, StatusMeta } from './projectShow.types';

  import ProjectFloorEditDialog from './ProjectFloorEditDialog.vue';

  const props = withDefaults(
    defineProps<{
      title: string;
      embedded?: boolean;
      floors: ProjectFloor[];
      floorSpaces: FloorSpace[];
      totalArea: number;
      averageHeight: number;
      emptyLabel: string;
      addFloorLabel?: string;
      addFloorTo?: RouteLocationRaw;
      projectId?: number;
      projectPreviewId?: number;

      /**
       * عندما تكون true يجب إضافة Preview أولاً
       * قبل السماح بإضافة Floor.
       */
      withPreview?: boolean;

      /**
       * Current project convert status.
       */
      status?: ConvertStatusType;

      floorLabel: string;
      typeLabel: string;
      spacesLabel: string;
      totalAreaMeterLabel: string;
      totalHeightMeterLabel: string;
      statusLabel: string;
      completedLabel: string;
      inProgressLabel: string;
      totalFloorsLabel: string;
      totalSpacesLabel: string;
      totalAreaLabel: string;
      averageHeightLabel: string;

      getFloorNumberLabel: (floorNumber?: number | null) => string;

      getFloorType: (floorNumber?: number | null) => string;

      getStatusMeta: (status?: number | null) => StatusMeta;

      calculateFloorArea: (floor: ProjectFloor) => number;

      getFloorHeight: (floor: ProjectFloor) => number;

      formatNumber: (value?: number | string | null, fractionDigits?: number) => string;

      formatArea: (value?: number | string | null) => string;
    }>(),
    {
      addFloorLabel: undefined,
      addFloorTo: undefined,
      projectId: undefined,
      projectPreviewId: undefined,
      withPreview: false,
      status: undefined,
      embedded: false,
    },
  );

  const emit = defineEmits<{
    updated: [floor: ProjectFloor];
  }>();

  const selectedFloor = ref<ProjectFloor | null>(null);

  const selectedProjectId = ref<number | undefined>(undefined);

  const selectedProjectPreviewId = ref<number | undefined>(undefined);

  const editFloorDialogVisible = ref(false);
  const updatingFloor = ref(false);
  const localFloors = ref<ProjectFloor[]>([]);

  watch(
    () => props.floors,
    (floors) => {
      localFloors.value = [...floors];
    },
    {
      immediate: true,
    },
  );

  const toPositiveInteger = (value: unknown): number | undefined => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;

    const numberValue = Number(normalizedValue);

    return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
  };

  /**
   * القسم يكون مقفولًا عندما:
   *
   * with_preview = true
   * ولا يوجد project_preview_id صالح.
   */
  const floorLockedByPreview = computed<boolean>(() => {
    return props.withPreview && !toPositiveInteger(props.projectPreviewId);
  });

  /**
   * السماح بإضافة Floor عندما:
   *
   * 1. الحالة تسمح بالإضافة.
   * 2. المشروع لا يحتاج Preview
   *    أو تمت إضافة Preview بالفعل.
   */
  const canAddFloor = computed<boolean>(() => {
    const currentStatus = Number(props.status);

    const statusAllowsAdding =
      currentStatus !== ConvertStatus.SEND_TO_CLIENT &&
      currentStatus !== ConvertStatus.ACCEPT_CLIENT;

    return statusAllowsAdding && !floorLockedByPreview.value;
  });

  const getAddFloorQuery = (): Record<string, unknown> => {
    if (!props.addFloorTo || typeof props.addFloorTo === 'string') {
      return {};
    }

    if (!('query' in props.addFloorTo) || !props.addFloorTo.query) {
      return {};
    }

    return props.addFloorTo.query;
  };

  const hasValidFloorId = (floor: ProjectFloor): boolean => {
    return toPositiveInteger(floor.id) !== undefined;
  };

  const getProjectId = (floor: ProjectFloor): number | undefined => {
    const addFloorQuery = getAddFloorQuery();

    return (
      toPositiveInteger(floor.project_id) ??
      toPositiveInteger(props.projectId) ??
      toPositiveInteger(addFloorQuery.project_id)
    );
  };

  const getProjectPreviewId = (floor: ProjectFloor): number | undefined => {
    const addFloorQuery = getAddFloorQuery();

    return (
      toPositiveInteger(floor.project_preview?.id) ??
      toPositiveInteger(floor.project_preview_id) ??
      toPositiveInteger(props.projectPreviewId) ??
      toPositiveInteger(addFloorQuery.project_preview_id)
    );
  };

  const openEditFloorDialog = (floor: ProjectFloor): void => {
    selectedFloor.value = floor;

    selectedProjectId.value = getProjectId(floor);

    selectedProjectPreviewId.value = getProjectPreviewId(floor);

    editFloorDialogVisible.value = true;
  };

  const closeEditFloorDialog = (): void => {
    if (updatingFloor.value) {
      return;
    }

    editFloorDialogVisible.value = false;
    selectedFloor.value = null;
    selectedProjectId.value = undefined;
    selectedProjectPreviewId.value = undefined;
  };

  const handleDialogVisibility = (visible: boolean): void => {
    if (visible) {
      editFloorDialogVisible.value = true;
      return;
    }

    closeEditFloorDialog();
  };

  const handleFloorUpdated = (updatedFloor: ProjectFloor): void => {
    const floorIndex = localFloors.value.findIndex(
      (floor) => Number(floor.id) === Number(updatedFloor.id),
    );

    if (floorIndex >= 0) {
      localFloors.value.splice(floorIndex, 1, updatedFloor);
    }

    emit('updated', updatedFloor);
  };

  const localFloorSpaces = computed<FloorSpace[]>(() => {
    return localFloors.value.flatMap((floor) => floor.spaces ?? []);
  });

  const localTotalArea = computed<number>(() => {
    return localFloors.value.reduce((total, floor) => {
      return total + props.calculateFloorArea(floor);
    }, 0);
  });

  const localAverageHeight = computed<number>(() => {
    if (!localFloors.value.length) {
      return 0;
    }

    const totalHeight = localFloors.value.reduce((total, floor) => {
      return total + props.getFloorHeight(floor);
    }, 0);

    return totalHeight / localFloors.value.length;
  });
  const canEditFloor = computed<boolean>(() => {
    return Number(props.status) !== ConvertStatus.ACCEPT_CLIENT;
  });
</script>

<template>
  <article
    id="project-floors"
    class="project-card project-floors-card"
    :class="{
      'project-floors-card--embedded': embedded,
      'project-floors-card--locked': floorLockedByPreview,
    }"
  >
    <div class="project-floors-toolbar">
      <div class="card-title project-floors-title">
        <i class="pi pi-building-columns" aria-hidden="true" />

        <h2>
          {{ title }}
        </h2>

        <!--
          تظهر علامة القفل عندما يحتاج المشروع
          إلى Preview ولم تتم إضافتها بعد.
        -->
        <div v-if="floorLockedByPreview" class="project-floor-locked" role="status">
          <i class="pi pi-lock" aria-hidden="true" />

          <span>
            {{ $t('ProjectFloor.preview_required_before_floor') }}
          </span>
        </div>

        <RouterLink
          v-else-if="canAddFloor && addFloorTo"
          class="project-action-btn project-action-btn--primary project-floor-add-action"
          :to="addFloorTo"
        >
          <i class="pi pi-plus" aria-hidden="true" />

          <span>
            {{ addFloorLabel || $t('ProjectFloor.add_action') }}
          </span>
        </RouterLink>
      </div>
    </div>

    <!--
      حالة فارغة ومقفولة:
      المشروع يحتاج Preview ولم تتم إضافتها.
    -->
    <div
      v-if="!localFloors.length && floorLockedByPreview"
      class="empty-panel project-floor-empty-locked"
      role="status"
      aria-disabled="true"
    >
      <span class="project-floor-empty-locked__icon">
        <i class="pi pi-lock" aria-hidden="true" />
      </span>

      <div class="project-floor-empty-locked__content">
        <strong>
          {{ $t('ProjectFloor.floors_locked') }}
        </strong>

        <span>
          {{ $t('ProjectFloor.preview_required_before_floor') }}
        </span>
      </div>
    </div>

    <RouterLink
      v-else-if="!localFloors.length && canAddFloor && addFloorTo"
      class="empty-panel empty-panel--link"
      :to="addFloorTo"
    >
      <i class="pi pi-plus-circle" aria-hidden="true" />

      <span>
        {{ emptyLabel }}
      </span>

      <small v-if="addFloorLabel">
        {{ addFloorLabel }}
      </small>
    </RouterLink>

    <div v-else-if="!localFloors.length" class="empty-panel">
      {{ emptyLabel }}
    </div>

    <div v-else class="floors-summary-layout">
      <div class="table-wrap">
        <table class="project-table">
          <thead>
            <tr>
              <th>
                {{ floorLabel }}
              </th>

              <th>
                {{ typeLabel }}
              </th>

              <th>
                {{ spacesLabel }}
              </th>

              <th>
                {{ totalAreaMeterLabel }}
              </th>

              <th>
                {{ totalHeightMeterLabel }}
              </th>

              <th>
                {{ statusLabel }}
              </th>

              <th>
                {{ $t('general.actions') }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="floor in localFloors" :key="floor.id">
              <td>
                {{ getFloorNumberLabel(floor.floor_number) }}
              </td>

              <td>
                {{ getFloorType(floor.floor_number) }}
              </td>

              <td>
                {{ floor.spaces?.length ?? 0 }}
              </td>

              <td>
                {{ formatNumber(calculateFloorArea(floor)) }}
              </td>

              <td>
                {{ formatNumber(getFloorHeight(floor)) }}
              </td>

              <td>
                <span
                  class="status-badge status-badge--inline"
                  :class="getStatusMeta(floor.status).className"
                >
                  {{ Number(floor.status) === 1 ? completedLabel : inProgressLabel }}
                </span>
              </td>

              <td class="floor-actions-cell">
                <button
                  v-if="hasValidFloorId(floor) && canEditFloor"
                  type="button"
                  class="project-action-btn project-action-btn--primary floor-edit-action"
                  :disabled="updatingFloor"
                  @click="openEditFloorDialog(floor)"
                >
                  <i class="pi pi-pen-to-square" aria-hidden="true" />

                  <span>
                    {{ $t('ProjectFloor.edit_action') }}
                  </span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside class="summary-panel">
        <div class="summary-cube">
          <i class="pi pi-objects-column" aria-hidden="true" />
        </div>

        <div>
          <span>
            {{ totalFloorsLabel }}
          </span>

          <strong>
            {{ localFloors.length }}
          </strong>
        </div>

        <div>
          <span>
            {{ totalSpacesLabel }}
          </span>

          <strong>
            {{ localFloorSpaces.length }}
          </strong>
        </div>

        <div>
          <span>
            {{ totalAreaLabel }}
          </span>

          <strong>
            {{ formatArea(localTotalArea) }}
          </strong>
        </div>

        <div>
          <span>
            {{ averageHeightLabel }}
          </span>

          <strong>
            {{ formatNumber(localAverageHeight) }}
            m
          </strong>
        </div>
      </aside>
    </div>
  </article>

  <ProjectFloorEditDialog
    :model-value="editFloorDialogVisible"
    :floor="selectedFloor"
    :project-id="selectedProjectId"
    :project-preview-id="selectedProjectPreviewId"
    @update:model-value="handleDialogVisibility"
    @updating="updatingFloor = $event"
    @updated="handleFloorUpdated"
  />
</template>

<style scoped lang="scss">
  .project-floors-card {
    position: relative;
  }

  .project-floors-toolbar {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin-block-end: 1rem;
  }

  .project-floors-title {
    display: flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75rem;
    margin: 0;
  }

  .project-floors-title h2 {
    min-width: 0;
    margin: 0;
  }

  .project-floor-add-action {
    display: inline-flex;
    width: fit-content;
    min-height: 2.35rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    margin-inline-start: auto;
    padding-inline: 0.85rem;
    text-decoration: none;
    white-space: nowrap;
  }

  .project-floor-locked {
    display: inline-flex;
    width: fit-content;
    min-height: 2.35rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    margin-inline-start: auto;
    padding: 0.55rem 0.85rem;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-full);
    background: var(--warning-light);
    color: var(--warning-dark);
    font-family: 'Medium';
    font-size: var(--sm-size);
    line-height: 1.4;
    text-align: center;
  }

  .project-floor-locked i {
    flex: 0 0 auto;
  }

  .project-floor-empty-locked {
    display: flex;
    min-height: 9rem;
    align-items: center;
    justify-content: center;
    gap: 0.85rem;
    padding: 1.25rem;
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-lg);
    background: rgb(255 255 255 / 65%);
    cursor: not-allowed;
    text-align: start;
  }

  .project-floor-empty-locked__icon {
    display: inline-flex;
    width: 2.75rem;
    height: 2.75rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--warning-light);
    color: var(--warning-dark);
    font-size: 1.1rem;
  }

  .project-floor-empty-locked__content {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.25rem;
  }

  .project-floor-empty-locked__content strong {
    color: var(--text-primary);
    font-family: 'Medium';
  }

  .project-floor-empty-locked__content span {
    color: var(--text-secondary);
    font-size: var(--sm-size);
    line-height: 1.6;
  }

  @media (max-width: 640px) {
    .project-floors-title {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .project-floor-add-action,
    .project-floor-locked {
      width: 100%;
      margin-inline-start: 0;
      justify-content: center;
    }

    .project-floor-empty-locked {
      flex-direction: column;
      text-align: center;
    }

    .project-floor-empty-locked__content {
      align-items: center;
    }
  }
</style>
