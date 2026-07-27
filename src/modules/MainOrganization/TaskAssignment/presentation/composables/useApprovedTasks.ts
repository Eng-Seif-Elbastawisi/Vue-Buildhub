import { computed, onMounted, ref } from 'vue';

import { useI18n } from 'vue-i18n';

import {
  DataFailed,
  DataLoading,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import ApprovedTasksController from '../controllers/task.approved.controller';

import TaskAssignmentApprovedTaskModel from '../../core/models/task.assignment.approved-task.model';

import FetchApprovedTasksParams from '../../core/params/fetch.approved.tasks.params';

export const useApprovedTasks = () => {
  const { t } = useI18n();

  const approvedTasksController = ApprovedTasksController.getInstance();

  const currentTasksPage = ref<number>(1);

  const tasksPerPage = ref<number>(10);

  const approvedTasksState = computed(() => approvedTasksController.approvedTasksState.value);

  const approvedTasksLoading = computed(() => approvedTasksState.value instanceof DataLoading);

  const approvedTasksError = computed((): string => {
    const state = approvedTasksState.value;

    if (state instanceof DataFailed) {
      return (
        state.error?.displayMessage || state.error?.title || t('task_assignment.unexpected_error')
      );
    }

    return '';
  });

  const approvedTasksPagination = computed(() => {
    const pagination = approvedTasksState.value.pagination;

    if (!pagination) {
      return null;
    }

    return {
      current: pagination.currentPage,
      last: pagination.lastPage,
      next: pagination.to,
      total: pagination.total,
      count: pagination.perPage,
    };
  });

  const approvedTasksRows = computed<TaskAssignmentApprovedTaskModel[]>(() => {
    const state = approvedTasksState.value;

    if (!(state instanceof DataSuccess) || !Array.isArray(state.data)) {
      return [];
    }

    console.group('[useApprovedTasks]');

    console.table(
      state.data.map((row) => ({
        id: row.id,

        constructor: row?.constructor?.name,

        isApprovedTaskModel: row instanceof TaskAssignmentApprovedTaskModel,

        projectName: row.projectName,

        departmentName: row.departmentName,

        departmentTitle: row.department?.title,

        itemName: row.departmentItemName,
      })),
    );

    console.groupEnd();

    return state.data;
  });

  const approvedTasksCount = computed((): number => {
    if (approvedTasksPagination.value) {
      return approvedTasksPagination.value.total;
    }

    return approvedTasksRows.value.length;
  });

  const fetchApprovedTasks = async (page: number = currentTasksPage.value): Promise<void> => {
    const parsedPage = Number(page);

    currentTasksPage.value = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const params = new FetchApprovedTasksParams({
      page: currentTasksPage.value,
      perPage: tasksPerPage.value,
      isAssign: 0,
    });

    await approvedTasksController.fetchApprovedTasks(params);
  };

  const onApprovedTasksPageChange = (page: number): void => {
    void fetchApprovedTasks(page);
  };

  const onApprovedTasksPerPageChange = (count: number): void => {
    const parsedCount = Number(count);

    if (!Number.isFinite(parsedCount) || parsedCount <= 0) {
      return;
    }

    tasksPerPage.value = parsedCount;

    void fetchApprovedTasks(1);
  };

  const valueOrEmpty = (value?: string | number | null): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return String(value);
  };

  const selectedApprovedTask = ref<TaskAssignmentApprovedTaskModel | null>(null);

  const assignmentDialogVisible = ref<boolean>(false);

  const openAssignmentDialog = (row: TaskAssignmentApprovedTaskModel): void => {
    selectedApprovedTask.value = row;

    assignmentDialogVisible.value = true;
  };

  const closeAssignmentDialog = (assignmentSubmitting = false): void => {
    if (assignmentSubmitting) {
      return;
    }

    assignmentDialogVisible.value = false;

    selectedApprovedTask.value = null;
  };

  onMounted(() => {
    void fetchApprovedTasks(1);
  });

  return {
    approvedTasksState,
    approvedTasksLoading,
    approvedTasksError,
    approvedTasksCount,
    approvedTasksPagination,
    approvedTasksRows,

    selectedApprovedTask,
    assignmentDialogVisible,

    fetchApprovedTasks,
    onApprovedTasksPageChange,
    onApprovedTasksPerPageChange,

    openAssignmentDialog,
    closeAssignmentDialog,

    valueOrEmpty,
  };
};
