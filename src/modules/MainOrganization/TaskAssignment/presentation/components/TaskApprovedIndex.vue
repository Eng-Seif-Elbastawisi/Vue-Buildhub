<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Dialog from 'primevue/dialog';

  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import IndexPageHeader from '@/shared/IndexPageHeader/IndexPageHeader.vue';
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
      label: 'item',
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
    <IndexPageHeader
      :title="$t('task_assignment.approved_tasks.title')"
      :subtitle="$t('task_assignment.approved_tasks.description')"
    />

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
              class="assignment-status bh-status"
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
      class="task-assignment-dialog workspace-dialog"
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

/* Dialog internal content */

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

/* Selected task summary */

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

/* Actions */

.assignment-dialog__actions {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
}

/* Assign button */

.task-assignment-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--PrimaryColor);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--PrimaryColor);
  font-family: 'Medium';
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;
}

.task-assignment-action-btn:hover:not(:disabled) {
  background: var(--PrimaryColor);
  color: #ffffff;
}

.task-assignment-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */

@media (max-width: 760px) {
  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .assignment-dialog__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .assignment-dialog__actions .btn {
    width: 100%;
  }

  .assignment-dialog__summary {
    grid-template-columns: 1fr;
  }
}
</style>

<!--
  Important:
  PrimeVue Dialog uses Teleport,
  so these styles must NOT be scoped.
-->

<style lang="scss">
/* ==============================
   PrimeVue Dialog
   ============================== */

.task-assignment-dialog.p-dialog {
  --p-dialog-background: #ffffff;
  --p-dialog-color: #111827;

  overflow: hidden;
  background: var(--bh-surface) !important;
  color: var(--bh-text) !important;
  border: 1px solid var(--bh-line) !important;
  border-radius: 12px !important;
  box-shadow: var(--bh-shadow-popover) !important;
}

/* Dialog header */

.task-assignment-dialog .p-dialog-header {
  padding: 1.25rem 1.5rem !important;
  background: var(--bh-surface) !important;
  color: var(--bh-text) !important;
  border-bottom: 1px solid var(--bh-line) !important;
}

/* Dialog content */

.task-assignment-dialog .p-dialog-content {
  padding: 1.5rem !important;
  background: var(--bh-surface) !important;
  color: var(--bh-text) !important;
}

/* Dialog footer */

.task-assignment-dialog .p-dialog-footer {
  padding: 1rem 1.5rem !important;
  background: var(--bh-surface) !important;
  color: var(--bh-text) !important;
  border-top: 1px solid var(--bh-line) !important;
}

/* Close button */

.task-assignment-dialog .p-dialog-header-close {
  width: 2.25rem;
  height: 2.25rem;
  background: transparent !important;
  color: var(--bh-muted) !important;
  border-radius: 50%;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.task-assignment-dialog .p-dialog-header-close:hover {
  background: var(--bh-canvas) !important;
  color: var(--bh-text) !important;
}

/* PrimeVue close icon */

.task-assignment-dialog .p-dialog-header-close svg,
.task-assignment-dialog .p-dialog-header-close .p-icon {
  color: inherit !important;
}

/* ==============================
   Dialog overlay / mask
   ============================== */

.p-dialog-mask {
  background: rgba(15, 23, 42, 0.28) !important;
  backdrop-filter: blur(2px);
}

/* ==============================
   Make form white as well
   ============================== */

.task-assignment-dialog .task-assignment-form {
  background: var(--bh-surface) !important;
  color: var(--bh-text) !important;
}

.task-assignment-dialog .task-assignment-form__grid {
  background: var(--bh-surface) !important;
}

/* Inputs */

.task-assignment-dialog .task-assignment-form__input,
.task-assignment-dialog .task-assignment-form__textarea {
  background: var(--bh-surface) !important;
  color: var(--bh-text) !important;
  border-color: var(--bh-field-line) !important;
}

.task-assignment-dialog .task-assignment-form__input::placeholder,
.task-assignment-dialog .task-assignment-form__textarea::placeholder {
  color: #9ca3af !important;
}

/* Labels */

.task-assignment-dialog .task-assignment-form__label,
.task-assignment-dialog .task-assignment-form__checkbox {
  color: var(--bh-text) !important;
}

/* ==============================
   Attachments
   ============================== */

.task-assignment-dialog .task-assignment-attachments {
  background: var(--bh-surface) !important;
  color: var(--bh-text) !important;
}

.task-assignment-dialog .task-assignment-attachments__header {
  background: var(--bh-surface) !important;
}

.task-assignment-dialog .task-assignment-attachments__header h2 {
  color: var(--bh-text) !important;
}

.task-assignment-dialog .task-assignment-attachments__header p {
  color: var(--bh-muted) !important;
}

.task-assignment-dialog .task-assignment-attachments__empty {
  background: var(--bh-surface) !important;
  color: var(--bh-muted) !important;
  border-color: var(--bh-line) !important;
}

.task-assignment-dialog .task-assignment-attachment {
  background: var(--bh-surface) !important;
  color: var(--bh-text) !important;
  border-color: var(--bh-line) !important;
}

.task-assignment-dialog .task-assignment-attachment__fields label {
  color: var(--bh-text) !important;
}

.task-assignment-dialog .task-assignment-attachment__meta strong {
  color: var(--bh-text) !important;
}

.task-assignment-dialog .task-assignment-attachment__meta small {
  color: var(--bh-muted) !important;
}

/* ==============================
   PrimeVue select inside dialog
   ============================== */

.task-assignment-dialog .p-select,
.task-assignment-dialog .p-multiselect {
  background: var(--bh-surface) !important;
  color: var(--bh-text) !important;
  border-color: var(--bh-field-line) !important;
}

.task-assignment-dialog .p-select-label,
.task-assignment-dialog .p-multiselect-label {
  color: var(--bh-text) !important;
}

.task-assignment-dialog .p-select-dropdown,
.task-assignment-dialog .p-multiselect-dropdown {
  color: var(--bh-muted) !important;
}

/* ==============================
   Responsive Dialog
   ============================== */

@media (max-width: 760px) {
  .task-assignment-dialog.p-dialog {
    width: calc(100vw - 1rem) !important;
    max-width: calc(100vw - 1rem) !important;
    margin: 0.5rem;
  }

  .task-assignment-dialog .p-dialog-header,
  .task-assignment-dialog .p-dialog-content,
  .task-assignment-dialog .p-dialog-footer {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
}
</style>
