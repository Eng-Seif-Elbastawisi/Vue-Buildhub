<script setup lang="ts">
  import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import {
    InsideStatusDecision,
    type InsideStatusDecisionValue,
  } from '../../core/constants/inside.status.decision.enum';
  import type TaskAssignmentEmployeeTaskModel from '../../core/models/task.assignment.employee-task.model';
  import TaskStatusAction from './TaskStatusAction.vue';

  type PaginationProps = {
    current: number;
    last: number;
    next: number;
    total: number;
    count: number;
  } | null;

  defineProps<{
    tasksState: DataState<TaskAssignmentEmployeeTaskModel[]>;
    tasksLoading: boolean;
    tasksPagination: PaginationProps;
    statusUpdateErrors: Record<number, string>;
    taskRows: (data: unknown) => TaskAssignmentEmployeeTaskModel[];
    formatDate: (value?: string | null) => string;
    valueOrEmpty: (value?: string | number | null) => string;
    isTaskUpdating: (task: TaskAssignmentEmployeeTaskModel) => boolean;
    isInsideStatusUpdating: (task: TaskAssignmentEmployeeTaskModel) => boolean;
    getStatusDisplay: (task: TaskAssignmentEmployeeTaskModel) => string;
    getStatusClass: (task: TaskAssignmentEmployeeTaskModel) => string;
  }>();

  const emit = defineEmits<{
    (event: 'refresh'): void;
    (event: 'change-page', page: number): void;
    (event: 'per-page-change', count: number): void;
    (event: 'change-status', task: TaskAssignmentEmployeeTaskModel, selectedStatus: string): void;
    (
      event: 'change-inside-status',
      task: TaskAssignmentEmployeeTaskModel,
      status: InsideStatusDecisionValue,
    ): void;
  }>();

  const retryTasks = async () => {
    emit('refresh');
  };
</script>

<template>
  <section class="employee-tasks-list" :aria-busy="tasksLoading">
    <div class="employee-tasks-list__head">
      <div>
        <h3>{{ $t('task_assignment.assigned_tasks') }}</h3>
        <p>{{ $t('task_assignment.assigned_tasks_description') }}</p>
      </div>
    </div>

    <DataStatusBuilder :controller="tasksState" :on-retry="retryTasks" inline-error>
      <template #loader>
        <div class="employee-tasks-list__skeleton" aria-hidden="true">
          <span v-for="item in 4" :key="item"></span>
        </div>
      </template>

      <template #failed="{ error, retry }">
        <div class="task-assignment-state task-assignment-state--error">
          <p>{{ error?.displayMessage || error?.title || $t('task_assignment.fetch_failed') }}</p>
          <button class="task-assignment-action-btn" type="button" @click="retry">
            <i class="pi pi-refresh" aria-hidden="true"></i>
            {{ $t('try_again') }}
          </button>
        </div>
      </template>

      <template #empty>
        <div class="task-assignment-state">
          {{ $t('task_assignment.empty_tasks') }}
        </div>
      </template>

      <template #success="{ data }">
        <div v-if="!taskRows(data).length" class="task-assignment-state">
          {{ $t('task_assignment.empty_tasks') }}
        </div>

        <div v-else class="task-assignment-table-wrap workspace-table-scroll">
          <table class="task-assignment-table workspace-data-table">
            <thead>
              <tr>
                <th>{{ $t('task_assignment.task') }}</th>
                <th>{{ $t('task_assignment.project') }}</th>
                <th>{{ $t('task_assignment.department_item') }}</th>
                <th>{{ $t('task_assignment.assigned_employees') }}</th>
                <th>{{ $t('task_assignment.notes') }}</th>
                <!-- <th>{{ $t('status') }}</th> -->
                <th v-if="taskRows(data).some((task) => task.insideStatus === 4)">
                  {{ $t('task_assignment.review_decision') }}
                </th>
                <th>{{ $t('general.actions') }}</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="task in taskRows(data)" :key="task.id ?? task.title">
                <td>{{ valueOrEmpty(task.title) }}</td>
                <td>{{ valueOrEmpty(task.projectName) }}</td>
                <td>{{ valueOrEmpty(task.departmentItemName) }}</td>
                <td>
                  <span v-if="!task.assignedEmployees.length">
                    {{ valueOrEmpty(null) }}
                  </span>
                  <span v-else class="employee-tasks-list__employees">
                    <span
                      v-for="employee in task.assignedEmployees"
                      :key="employee.id ?? employee.name"
                      class="employee-tasks-list__employee"
                    >
                      {{ employee.name }}
                    </span>
                  </span>
                </td>
                <td>{{ valueOrEmpty(task.notes) }}</td>
                <!-- <td>
                  <span class="task-assignment-status-badge" :class="getStatusClass(task)">
                    {{ getStatusDisplay(task) }}
                  </span>
                </td> -->
                <!-- <td>{{ formatDate(task.createdAt) }}</td> -->
                <!-- <td>{{ formatDate(task.dueDate) }}</td> -->
                <td v-if="task.insideStatus === 4">
                  <div class="employee-tasks-list__review-actions">
                    <!--     :disabled="!task.projectDepartmentItemId || isInsideStatusUpdating(task)" -->
                    <button
                      type="button"
                      class="task-review-action task-review-action--accept"
                      @click="emit('change-inside-status', task, InsideStatusDecision.ACCEPT)"
                    >
                      <i
                        :class="
                          isInsideStatusUpdating(task) ? 'pi pi-spin pi-spinner' : 'pi pi-check'
                        "
                        aria-hidden="true"
                      ></i>
                      {{ $t('task_assignment.accept') }}
                    </button>

                    <button
                      type="button"
                      class="task-review-action task-review-action--reject"
                      @click="emit('change-inside-status', task, InsideStatusDecision.REJECT)"
                    >
                      <!--  :disabled="!task.projectDepartmentItemId || isInsideStatusUpdating(task)" -->
                      <i class="pi pi-times" aria-hidden="true"></i>
                      {{ $t('task_assignment.reject') }}
                    </button>
                  </div>
                </td>
                <td>
                  <TaskStatusAction
                    :task="task"
                    :disabled="isTaskUpdating(task)"
                    :status-error="task.id ? statusUpdateErrors[task.id] : ''"
                    @change-status="
                      (selectedTask, selectedStatus) =>
                        emit('change-status', selectedTask, selectedStatus)
                    "
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Pagination
          :pagination="tasksPagination"
          appearance="custom"
          @change-page="emit('change-page', $event)"
          @count-per-page="emit('per-page-change', $event)"
        />
      </template>
    </DataStatusBuilder>
  </section>
</template>
