<script setup lang="ts">
  import type { RouteLocationRaw } from 'vue-router';

  import type { FloorSpace, ProjectFloor, StatusMeta } from './projectShow.types';

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
      embedded: false,
    },
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

  const getEditFloorRoute = (floor: ProjectFloor): RouteLocationRaw => {
    const addFloorQuery = getAddFloorQuery();
    const projectId =
      toPositiveInteger(floor.project_id) ?? toPositiveInteger(addFloorQuery.project_id);
    const projectPreviewId =
      toPositiveInteger(floor.project_preview?.id) ??
      toPositiveInteger(floor.project_preview_id) ??
      toPositiveInteger(addFloorQuery.project_preview_id);
    const query: Record<string, number> = {};

    if (projectId) query.project_id = projectId;
    if (projectPreviewId) query.project_preview_id = projectPreviewId;

    return {
      name: 'edit-project_floor',
      params: {
        project_floor_id: toPositiveInteger(floor.id),
      },
      query,
    };
  };
</script>

<template>
  <article
    id="project-floors"
    class="project-card project-floors-card"
    :class="{ 'project-floors-card--embedded': embedded }"
  >
    <div v-if="!embedded" class="card-title">
      <i class="pi pi-clipboard"></i>
      <h2>{{ title }}</h2>
    </div>

    <RouterLink
      v-if="!floors.length && addFloorTo"
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

    <div v-else-if="!floors.length" class="empty-panel">
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
            <tr v-for="floor in floors" :key="floor.id">
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
                <RouterLink
                  v-if="hasValidFloorId(floor)"
                  class="project-action-btn project-action-btn--primary floor-edit-action"
                  :to="getEditFloorRoute(floor)"
                >
                  <i class="pi pi-pencil"></i>
                  <span>{{ $t('ProjectFloor.edit_action') }}</span>
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside class="summary-panel">
        <div class="summary-cube">
          <i class="pi pi-building"></i>
        </div>
        <div>
          <span>{{ totalFloorsLabel }}</span>
          <strong>{{ floors.length }}</strong>
        </div>
        <div>
          <span>{{ totalSpacesLabel }}</span>
          <strong>{{ floorSpaces.length }}</strong>
        </div>
        <div>
          <span>{{ totalAreaLabel }}</span>
          <strong>{{ formatArea(totalArea) }}</strong>
        </div>
        <div>
          <span>{{ averageHeightLabel }}</span>
          <strong>{{ formatNumber(averageHeight) }} m</strong>
        </div>
      </aside>
    </div>
  </article>
</template>
