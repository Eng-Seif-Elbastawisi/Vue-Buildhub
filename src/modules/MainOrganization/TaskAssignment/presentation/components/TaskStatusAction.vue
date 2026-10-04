<script setup lang="ts">
  import { computed } from 'vue';

  import type TaskAssignmentEmployeeTaskModel from '../../core/models/task.assignment.employee-task.model';

  import { useUserStore } from '@/stores/user';

  const props = defineProps<{
    task: TaskAssignmentEmployeeTaskModel;
    disabled: boolean;
    statusError?: string;
  }>();

  const { user } = useUserStore();

  const emit = defineEmits<{
    (event: 'change-status', task: TaskAssignmentEmployeeTaskModel, selectedStatus: string): void;
  }>();

  const statusValue = computed(() => {
    if (props.task.status === undefined || props.task.status === null) {
      return '';
    }

    return String(props.task.status);
  });

  const showRoute = computed(() => {
    const id = props.task.projectDepartmentItemId;
    const uuid = props.task.uuid;

    if (!id || !uuid) {
      return null;
    }

    return {
      name: user?.isMaster ? 'admin-task-assignment-show' : 'mainorganization-task-assignment-show',

      params: {
        id,
      },

      query: {
        uuid,
      },
    };
  });

  const handleStatusChange = (event: Event): void => {
    const select = event.target as HTMLSelectElement;

    emit('change-status', props.task, select.value);
  };
</script>

<template>
  <div class="task-status-action">
    <router-link v-if="showRoute" class="action-btn show" :to="showRoute" :title="$t('show')">
      <i class="pi pi-eye"></i>
    </router-link>

    <button v-else type="button" class="action-btn show" disabled :title="$t('show')">
      <i class="pi pi-eye"></i>
    </button>

    <select
      v-if="task.statusUpdateAction && task.availableStatuses?.length"
      class="task-status-action__select"
      :value="statusValue"
      :disabled="disabled"
      @change="handleStatusChange"
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

    <!-- <span
      v-else
      class="task-status-action__readonly"
    >
      {{
        $t(
          'task_assignment.status_action_unavailable',
        )
      }}
    </span> -->

    <small v-if="statusError" class="task-assignment-error">
      {{ statusError }}
    </small>
  </div>
</template>
