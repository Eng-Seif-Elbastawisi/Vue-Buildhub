<script setup lang="ts">
  import type { ProjectItemRow } from './projectShow.types';

  defineProps<{
    title: string;
    items: unknown[];
    emptyLabel: string;
    idLabel: string;
    titleLabel: string;
    addItem: string;
    addItemTo: { path: string; query: Record<string, unknown> };
    valueOrEmpty: (value?: string | number | null) => string;
  }>();

  const getProjectItem = (item: unknown): ProjectItemRow => {
    return (item ?? {}) as ProjectItemRow;
  };
</script>

<template>
  <article id="project-items" class="project-card">
    <div class="card-title">
      <i class="pi pi-box"></i>
      <h2>{{ title }}</h2>
    </div>

    <RouterLink v-if="!items.length" class="empty-panel empty-panel--link" :to="addItemTo">
      <i class="pi pi-plus-circle"></i> {{ emptyLabel }}
    </RouterLink>

    <div v-else class="table-wrap">
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
  </article>
</template>
