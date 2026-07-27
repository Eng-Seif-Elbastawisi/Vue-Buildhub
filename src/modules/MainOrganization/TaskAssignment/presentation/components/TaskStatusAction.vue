<script setup lang="ts">
  import { computed } from 'vue';
  import type TaskAssignmentEmployeeTaskModel from '../../core/models/task.assignment.employee-task.model';

  const props = defineProps<{
    task: TaskAssignmentEmployeeTaskModel;
    disabled: boolean;
    statusError?: string;
  }>();

  const emit = defineEmits<{
    (event: 'change-status', task: TaskAssignmentEmployeeTaskModel, selectedStatus: string): void;
  }>();

  const statusValue = computed(() =>
    props.task.status === undefined || props.task.status === null ? '' : String(props.task.status),
  );
</script>

<template>
  <div class="task-status-action">
    <select
      v-if="task.statusUpdateAction && task.availableStatuses.length"
      class="task-status-action__select"
      :value="statusValue"
      :disabled="disabled"
      @change="emit('change-status', task, ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>
        {{ $t('task_assignment.change_status') }}
      </option>
      <option
        v-for="statusOption in task.availableStatuses"
        :key="statusOption.id"
        :value="statusOption.id"
      >
        {{ statusOption.title }}
      </option>
    </select>

    <span v-else class="task-status-action__readonly">
      {{ $t('task_assignment.status_action_unavailable') }}
    </span>

    <small v-if="statusError" class="task-assignment-error">
      {{ statusError }}
    </small>
  </div>
</template>
