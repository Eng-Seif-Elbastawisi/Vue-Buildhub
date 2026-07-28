<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Dialog from 'primevue/dialog';

  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';

  import TaskAssignmentController from '../controllers/task.assignment.controller';
  import FetchApprovedTasksParams from '../../core/params/fetch.approved.tasks.params';
  import TaskAssignmentApprovedTaskModel from '../../core/models/task.assignment.approved-task.model';
  import type AssignProjectDepartmentItemTaskParams from '../../core/params/assign.project.department.item.task.params';

  import TaskAssignmentForm from './TaskAssignmentForm.vue';

  const controller = TaskAssignmentController.getInstance();

  const route = useRoute();
  const router = useRouter();

  const perPage = ref(10);

  const state = computed(() => controller.approvedTasksState.value);
  const assignmentDialogVisible = ref(false);
  const selectedTask = ref<TaskAssignmentApprovedTaskModel | null>(null);
  const assignmentParams = ref<AssignProjectDepartmentItemTaskParams | null>(null);
  const assignmentLoading = ref(false);

  const currentPage = computed(() => {
    const page = Number(route.query.page);

    return Number.isInteger(page) && page > 0 ? page : 1;
  });

  const headers: TableHeader[] = [
    {
      key: 'projectName',
      label: 'task_assignment.table.project',
      sortable: true,
    },
    {
      key: 'departmentName',
      label: 'task_assignment.table.department',
      sortable: true,
    },
    {
      key: 'itemName',
      label: 'task_assignment.table.department_item',
      sortable: true,
    },
    {
      key: 'quantity',
      label: 'task_assignment.table.quantity',
      sortable: true,
    },
    {
      key: 'price',
      label: 'task_assignment.table.price',
      sortable: true,
    },
    {
      key: 'finalPrice',
      label: 'task_assignment.table.final_price',
      sortable: true,
    },
    {
      key: 'isAssign',
      label: 'task_assignment.table.assignment',
    },
  ];

  const getTableItems = (
    data: Array<TaskAssignmentApprovedTaskModel | Record<string, unknown>> | null,
  ): TaskAssignmentApprovedTaskModel[] => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((task) =>
      task instanceof TaskAssignmentApprovedTaskModel
        ? task
        : TaskAssignmentApprovedTaskModel.fromJson(task),
    );
  };

  const formatNumber = (numericValue: number): string => {
    return numericValue.toLocaleString();
  };

  const openAssignmentDialog = (task: TaskAssignmentApprovedTaskModel): void => {
    selectedTask.value = task;
    assignmentParams.value = null;
    assignmentDialogVisible.value = true;
  };

  const closeAssignmentDialog = (): void => {
    assignmentDialogVisible.value = false;
    selectedTask.value = null;
    assignmentParams.value = null;
  };

  const canAssignTask = (task: TaskAssignmentApprovedTaskModel): boolean => {
    return !task.isAssign;
  };

  const fetchApprovedTasks = async (page: number = currentPage.value): Promise<void> => {
    await controller.fetchApprovedTasks(
      new FetchApprovedTasksParams('', page, perPage.value, 1, 0),
    );
  };

  const assignTask = async (): Promise<void> => {
    if (!assignmentParams.value) {
      return;
    }

    const validation = assignmentParams.value.validate();

    if (!validation.isValid) {
      assignmentParams.value.validateOrThrow();
      return;
    }

    assignmentLoading.value = true;

    try {
      const response = await controller.assignTask(assignmentParams.value);

      if (response.hasError) {
        return;
      }

      closeAssignmentDialog();

      await fetchApprovedTasks(currentPage.value);
    } finally {
      assignmentLoading.value = false;
    }
  };

  const onPageChange = async (page: number): Promise<void> => {
    await router.push({
      query: {
        ...route.query,
        page: String(page),
      },
    });

    await fetchApprovedTasks(page);
  };

  const onPerPageChange = async (count: number): Promise<void> => {
    perPage.value = count;

    await router.push({
      query: {
        ...route.query,
        page: '1',
      },
    });

    await fetchApprovedTasks(1);
  };

  onMounted(() => {
    void fetchApprovedTasks();
  });
</script>

<template>
  <div class="task-assignment-approved-page">
    <header class="page-header">
      <div>
        <h4>
          {{ $t('task_assignment.approved_tasks.title') }}
        </h4>

        <p>
          {{ $t('task_assignment.approved_tasks.description') }}
        </p>
      </div>
    </header>

    <DataStatusBuilder :controller="state" :on-retry="fetchApprovedTasks">
      <template #success="{ data }">
        <AppTable :headers="headers" :items="getTableItems(data)" show-index hoverable striped>
          <template #cell-price="{ item }">
            {{ formatNumber(item.price) }}
          </template>

          <template #cell-finalPrice="{ item }">
            {{ formatNumber(item.finalPrice) }}
          </template>

          <template #cell-isAssign="{ item }">
            <span
              class="assignment-status"
              :class="{
                assigned: item.isAssign,
              }"
            >
              {{
                $t(
                  item.isAssign
                    ? 'task_assignment.table.assigned'
                    : 'task_assignment.table.not_assigned',
                )
              }}
            </span>
          </template>

          <template #actions="{ item }">
            <button
              v-if="canAssignTask(item)"
              type="button"
              class="task-assignment-action-btn"
              :disabled="assignmentLoading"
              @click="openAssignmentDialog(item)"
            >
              <i class="pi pi-user-plus" aria-hidden="true" />

              <span>
                {{ $t('task_assignment.action.assign') }}
              </span>
            </button>
          </template>
        </AppTable>

        <Pagination
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>

      <template #empty>
        <div class="empty-state">
          <h3>
            {{ $t('task_assignment.approved_tasks.empty_title') }}
          </h3>

          <p>
            {{ $t('task_assignment.approved_tasks.empty_description') }}
          </p>
        </div>
      </template>

      <template #loader>
        <TableSkelaton
          :rows="5"
          :columns="headers.length"
          :has-actions="true"
          :show-index="true"
          :selectable="false"
        />
      </template>
    </DataStatusBuilder>

    <Dialog
      v-model:visible="assignmentDialogVisible"
      modal
      :draggable="false"
      :style="{ width: '850px', maxWidth: '95vw' }"
      class="task-assignment-dialog"
      @hide="closeAssignmentDialog"
    >
      <template #header>
        <div class="assignment-dialog__header">
          <h4>
            {{ $t('task_assignment.assignment_dialog.title') }}
          </h4>

          <p>
            {{ $t('task_assignment.assignment_dialog.description') }}
          </p>
        </div>
      </template>

      <div v-if="selectedTask" class="assignment-dialog__body">
        <dl class="assignment-dialog__summary">
          <div class="assignment-dialog__summary-item">
            <dt>
              {{ $t('task_assignment.project') }}
            </dt>

            <dd>
              {{ selectedTask.projectName }}
            </dd>
          </div>

          <div class="assignment-dialog__summary-item">
            <dt>
              {{ $t('task_assignment.department') }}
            </dt>

            <dd>
              {{ selectedTask.departmentName }}
            </dd>
          </div>

          <div class="assignment-dialog__summary-item">
            <dt>
              {{ $t('task_assignment.department_item') }}
            </dt>

            <dd>
              {{ selectedTask.itemName }}
            </dd>
          </div>
        </dl>

        <TaskAssignmentForm
          :key="selectedTask.id"
          :project-department-item-id="selectedTask.id"
          :loading="assignmentLoading"
          @update-data="assignmentParams = $event"
        />
      </div>

      <template #footer>
        <div class="assignment-dialog__actions">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="assignmentLoading"
            @click="closeAssignmentDialog"
          >
            {{ $t('cancel') }}
          </button>

          <button
            type="button"
            class="btn btn-primary"
            :class="{ 'btn--loading': assignmentLoading }"
            :disabled="assignmentLoading || !assignmentParams"
            @click="assignTask"
          >
            {{ $t('task_assignment.submit') }}
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped lang="scss">
  .task-assignment-approved-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .page-header p,
  .empty-state p {
    color: var(--gray-5);
  }

  .empty-state {
    padding: 3rem 1rem;
    text-align: center;
  }

  .assignment-status {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.625rem;
    border-radius: 0.375rem;
    background: var(--gray-100);
    color: var(--gray-700);
    font-family: 'Medium';
  }

  .assignment-status.assigned {
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .assignment-dialog__header,
  .assignment-dialog__body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .assignment-dialog__header h4,
  .assignment-dialog__header p,
  .assignment-dialog__summary {
    margin: 0;
  }

  .assignment-dialog__header h4 {
    color: var(--gray-900);
    font-family: 'Bold';
  }

  .assignment-dialog__header p,
  .assignment-dialog__summary-item dt {
    color: var(--gray-600);
    font-family: 'Medium';
    font-size: var(--xs-size);
  }

  .assignment-dialog__summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    padding: 0.85rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--gray-50);
  }

  .assignment-dialog__summary-item {
    min-width: 0;
  }

  .assignment-dialog__summary-item dd {
    overflow: hidden;
    margin: 0.25rem 0 0;
    color: var(--gray-900);
    font-family: 'Bold';
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .assignment-dialog__actions {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  @media (max-width: 760px) {
    .page-header,
    .assignment-dialog__actions {
      align-items: stretch;
      flex-direction: column;
    }

    .assignment-dialog__summary {
      grid-template-columns: 1fr;
    }
  }
</style>
