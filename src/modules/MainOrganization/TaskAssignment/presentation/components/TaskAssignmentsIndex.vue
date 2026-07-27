<script setup lang="ts">
  // import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import EmployeeTasksList from './EmployeeTasksList.vue';
  import { useEmployeeTasks } from '../composables/useEmployeeTasks';

  const {
    // selectedEmployeeFilter,
    // employeeOptions,
    // employeesLoading,
    tasksState,
    tasksLoading,
    tasksCount,
    tasksPagination,
    statusUpdateErrors,
    valueOrEmpty,
    formatDate,
    taskRows,
    fetchEmployeeTasks,
    changeTaskStatus,
    isTaskUpdating,
    getStatusDisplay,
    getStatusClass,
    onPerPageChange,
    // onEmployeeFilterChange,
  } = useEmployeeTasks();
</script>

<template>
  <section class="task-assignments-index">
    <article class="task-assignment-card task-assignment-card--list">
      <header class="task-assignment-page-header">
        <div class="task-assignment-page-header__content">
          <span class="task-assignment-page-header__icon" aria-hidden="true">
            <i class="pi pi-user-plus"></i>
          </span>

          <div class="task-assignment-page-header__copy">
            <h1>{{ $t('task_assignment.title') }}</h1>
            <p>{{ $t('task_assignment.description') }}</p>
          </div>
        </div>

        <div class="task-assignment-page-header__actions">
          <span class="task-assignment-page-header__count">
            {{ tasksCount }} {{ $t('task_assignment.tasks_count') }}
          </span>

          <!-- <button
            class="task-assignment-page-header__refresh"
            type="button"
            :disabled="tasksLoading"
            @click="fetchEmployeeTasks()"
          >
            <i class="pi pi-refresh" :class="{ 'pi-spin': tasksLoading }" aria-hidden="true"></i>
            <span>{{ $t('task_assignment.refresh_tasks') }}</span>
          </button> -->

          <!-- <RouterLink
            class="task-assignment-page-header__add"
            :to="{ name: 'mainorganization-task-assignment-create' }"
          >
            <i class="pi pi-plus" aria-hidden="true"></i>
            <span>{{ $t('task_assignment.add_task') }}</span>
          </RouterLink> -->
        </div>
      </header>

      <!-- <div class="task-assignment-filters" style="margin-bottom: 1.5rem; padding: 0 1.5rem">
        <UpdatedCustomInputSelect
          id="employee_filter"
          :model-value="selectedEmployeeFilter"
          label="task_assignment.filters.employee_label"
          :placeholder="$t('task_assignment.filters.employee_placeholder')"
          :static-options="employeeOptions"
          :reload="false"
          :disabled="employeesLoading"
          show-clear
          @update:model-value="onEmployeeFilterChange"
        />
      </div> -->

      <EmployeeTasksList
        :tasks-state="tasksState"
        :tasks-loading="tasksLoading"
        :tasks-pagination="tasksPagination"
        :status-update-errors="statusUpdateErrors"
        :task-rows="taskRows"
        :format-date="formatDate"
        :value-or-empty="valueOrEmpty"
        :is-task-updating="isTaskUpdating"
        :get-status-display="getStatusDisplay"
        :get-status-class="getStatusClass"
        @refresh="fetchEmployeeTasks()"
        @change-page="fetchEmployeeTasks"
        @per-page-change="onPerPageChange"
        @change-status="changeTaskStatus"
      />
    </article>
  </section>
</template>

<style lang="scss">
  @use '../styles/task_assignment';
</style>
