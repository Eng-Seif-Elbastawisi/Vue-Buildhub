<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import type { RouteLocationRaw } from 'vue-router';

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
    { immediate: true },
  );

  const toPositiveInteger = (value: unknown): number | undefined => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    const numberValue = Number(normalizedValue);

    return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
  };

  const getAddFloorQuery = (): Record<string, unknown> => {
    if (!props.addFloorTo || typeof props.addFloorTo === 'string') return {};
    if (!('query' in props.addFloorTo) || !props.addFloorTo.query) return {};

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

  const localTotalArea = computed(() => {
    return localFloors.value.reduce((total, floor) => total + props.calculateFloorArea(floor), 0);
  });

  const localAverageHeight = computed(() => {
    if (!localFloors.value.length) {
      return 0;
    }

    const totalHeight = localFloors.value.reduce(
      (total, floor) => total + props.getFloorHeight(floor),
      0,
    );

    return totalHeight / localFloors.value.length;
  });
</script>

<template>
  <article
    id="project-floors"
    class="project-card project-floors-card"
    :class="{ 'project-floors-card--embedded': embedded }"
  >
    <div v-if="!embedded" class="card-title">
      <i class="pi pi-building-columns"></i>
      <h2>{{ title }}</h2>
    </div>

    <RouterLink
      v-if="!localFloors.length && addFloorTo"
      class="empty-panel empty-panel--link"
      :to="addFloorTo"
    >
      <i class="pi pi-plus-circle"></i>

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
              <th>{{ floorLabel }}</th>
              <th>{{ typeLabel }}</th>
              <th>{{ spacesLabel }}</th>
              <th>{{ totalAreaMeterLabel }}</th>
              <th>{{ totalHeightMeterLabel }}</th>
              <th>{{ statusLabel }}</th>
              <th>{{ $t('general.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="floor in localFloors" :key="floor.id">
              <td>{{ getFloorNumberLabel(floor.floor_number) }}</td>
              <td>{{ getFloorType(floor.floor_number) }}</td>
              <td>{{ floor.spaces?.length ?? 0 }}</td>
              <td>{{ formatNumber(calculateFloorArea(floor)) }}</td>
              <td>{{ formatNumber(getFloorHeight(floor)) }}</td>
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
                  v-if="hasValidFloorId(floor)"
                  type="button"
                  class="project-action-btn project-action-btn--primary floor-edit-action"
                  :disabled="updatingFloor"
                  @click="openEditFloorDialog(floor)"
                >
                  <i class="pi pi-pen-to-square" aria-hidden="true" />
                  <span>{{ $t('ProjectFloor.edit_action') }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside class="summary-panel">
        <div class="summary-cube">
          <i class="pi pi-objects-column"></i>
        </div>
        <div>
          <span>{{ totalFloorsLabel }}</span>
          <strong>{{ localFloors.length }}</strong>
        </div>
        <div>
          <span>{{ totalSpacesLabel }}</span>
          <strong>{{ localFloorSpaces.length }}</strong>
        </div>
        <div>
          <span>{{ totalAreaLabel }}</span>
          <strong>{{ formatArea(localTotalArea) }}</strong>
        </div>
        <div>
          <span>{{ averageHeightLabel }}</span>
          <strong>{{ formatNumber(localAverageHeight) }} m</strong>
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
