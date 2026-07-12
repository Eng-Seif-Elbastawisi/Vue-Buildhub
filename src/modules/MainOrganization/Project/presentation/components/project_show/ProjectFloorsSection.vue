<script setup lang="ts">
  import type { FloorSpace, ProjectFloor, StatusMeta } from './projectShow.types';

  defineProps<{
    title: string;
    floors: ProjectFloor[];
    floorSpaces: FloorSpace[];
    totalArea: number;
    averageHeight: number;
    emptyLabel: string;
    addFloorLabel?: string;
    addFloorTo?: Record<string, unknown>;
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
  }>();
</script>

<template>
  <article id="project-floors" class="project-card">
    <div class="card-title">
      <i class="pi pi-clipboard"></i>
      <h2>{{ title }}</h2>
    </div>

    <RouterLink v-if="!floors.length && addFloorTo" class="empty-panel empty-panel--link" :to="addFloorTo">
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
