<script setup lang="ts">
  import { computed } from 'vue';
  import {
    DataLoading,
    type DataState,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type WorkTaskModel from '../../core/models/task.model';
  import WorkItemSection from './WorkItemSection.vue';

  const props = defineProps<{
    state: DataState<WorkTaskModel[]>;
    stageLabel: (id: number) => string;
  }>();
  const emit = defineEmits<{ retry: [] }>();
  const tasks = computed(() => props.state.data ?? []);
  const tasksLoading = computed(() => props.state instanceof DataLoading);
</script>
<template>
  <WorkItemSection
    :title="$t('work_items.tasks')"
    icon="pi pi-check-square"
    :count="state.data?.length"
    :loading="tasksLoading"
    :error="state.error ? $t(state.error.displayMessage) : undefined"
    :empty="!tasks.length"
    :empty-message="$t('work_items.tasks_empty')"
    @retry="emit('retry')"
  >
    <ul class="work-items-records">
      <li v-for="task in tasks" :key="task.id">
        <h3>{{ task.title }}</h3>
        <p class="work-items-stage-label">{{ stageLabel(task.projectTimelineStageId) }}</p>
        <dl>
          <div>
            <dt>{{ $t('work_items.assigned_employee') }}</dt>
            <dd>{{ task.assignedEmployee?.name ?? $t('work_items.unassigned') }}</dd>
          </div>
          <div>
            <dt>{{ $t('work_items.end_date') }}</dt>
            <dd>{{ task.endDate ?? $t('work_items.no_date') }}</dd>
          </div>
          <div>
            <dt>{{ $t('work_items.created_by') }}</dt>
            <dd>{{ task.employee.name }}</dd>
          </div>
          <div>
            <dt>{{ $t('work_items.created_at') }}</dt>
            <dd>{{ task.createdAt ?? $t('work_items.no_date') }}</dd>
          </div>
        </dl>
      </li>
    </ul>
  </WorkItemSection>
</template>
