<script setup lang="ts">
  import { computed, ref } from 'vue';
  import {
    DataLoading,
    type DataState,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type WorkActivityModel from '../../core/models/activity.model';
  import WorkItemSection from './WorkItemSection.vue';
  import { WorkActivityType } from '../../core/constants/work-items.constants';
  const props = defineProps<{
    state: DataState<WorkActivityModel[]>;
    stageLabel: (id: number) => string;
  }>();
  const emit = defineEmits<{ retry: [] }>();
  const filter = ref(0);
  const activities = computed(() =>
    (props.state.data ?? []).filter((record) => !filter.value || record.type === filter.value),
  );
  const activitiesLoading = computed(() => props.state instanceof DataLoading);
</script>
<template>
  <WorkItemSection
    :title="$t('work_items.activities')"
    icon="pi pi-comments"
    :count="state.data?.length"
    :loading="activitiesLoading"
    :error="state.error ? $t(state.error.displayMessage) : undefined"
    :empty="!activities.length"
    :empty-message="$t('work_items.activities_empty')"
    @retry="emit('retry')"
  >
    <template #filters
      ><div class="work-items-filters" role="group" :aria-label="$t('work_items.filter_type')">
        <button
          v-for="type in [0, 1, 2, 3, 4]"
          :key="type"
          type="button"
          :aria-pressed="filter === type"
          @click="filter = type"
        >
          {{ $t(type ? `work_items.type_${type}` : 'work_items.all') }}
        </button>
      </div></template
    >
    <ul class="work-items-records">
      <li v-for="activity in activities" :key="activity.id">
        <div class="work-items-record-heading">
          <h3>{{ activity.title }}</h3>
          <span class="work-items-badge" :class="`work-items-type-${activity.type}`">{{
            $t(`work_items.type_${activity.type}`)
          }}</span>
        </div>
        <p class="work-items-stage-label">{{ stageLabel(activity.projectTimelineStageId) }}</p>
        <p v-if="activity.type !== WorkActivityType.Meeting" class="work-items-notes">
          {{ activity.description ?? $t('work_items.no_notes') }}
        </p>
        <dl>
          <div v-if="activity.type === WorkActivityType.Meeting">
            <dt>{{ $t('work_items.meeting_date') }}</dt>
            <dd>{{ activity.date ?? $t('work_items.no_date') }}</dd>
          </div>
          <div v-if="activity.assignedEmployee">
            <dt>{{ $t('work_items.assigned_employee') }}</dt>
            <dd>{{ activity.assignedEmployee.name }}</dd>
          </div>
          <div>
            <dt>{{ $t('work_items.created_by') }}</dt>
            <dd>{{ activity.employee.name }}</dd>
          </div>
        </dl>
      </li>
    </ul>
  </WorkItemSection>
</template>
