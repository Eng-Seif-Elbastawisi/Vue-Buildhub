<script setup lang="ts">
  import type { RouteLocationRaw } from 'vue-router';
  import type { ProjectItemRow } from './projectShow.types';

  defineProps<{
    title: string;
    items: unknown[];
    emptyLabel: string;
    idLabel: string;
    titleLabel: string;
    addItem: string;
    addItemTo: RouteLocationRaw;
    valueOrEmpty: (value?: string | number | null) => string;
  }>();

  const getProjectItem = (item: unknown): ProjectItemRow => {
    return (item ?? {}) as ProjectItemRow;
  };
</script>

<template>
  <details id="project-items" class="project-card project-items-card project-section-disclosure">
    <summary class="card-title">
      <i class="pi pi-shopping-bag"></i>
      <h2>{{ title }}</h2>
      <i class="pi pi-chevron-down project-disclosure-chevron" aria-hidden="true"></i>
    </summary>

    <RouterLink v-if="!items.length" class="empty-panel empty-panel--link" :to="addItemTo">
      <i class="pi pi-plus-circle"></i> {{ emptyLabel }}
    </RouterLink>

    <div v-else class="table-wrap project-items-table-scroll">
      <table class="project-table">
        <thead>
          <tr>
            <th>{{ idLabel }}</th>
            <th>{{ titleLabel }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td>{{ getProjectItem(item).id ?? index + 1 }}</td>
            <td>{{ valueOrEmpty(getProjectItem(item).title) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </details>
</template>
