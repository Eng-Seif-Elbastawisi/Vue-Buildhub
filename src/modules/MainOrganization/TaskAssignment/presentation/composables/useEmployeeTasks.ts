import { computed, onMounted, reactive, ref, watch } from 'vue';

import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import {
  DataLoading,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';

import FetchEmployeeTasksParams from '../../core/params/fetch.employee.tasks.params';
import ChangeInsideStatusParams from '../../core/params/change.inside.status.params';

import type TaskAssignmentEmployeeTaskModel from '../../core/models/task.assignment.employee-task.model';

import TaskAssignmentController from '../controllers/task.assignment.controller';

import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';

import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';

import TitleInterface from '@/base/Data/Models/titleInterface';

import { InsideStatusType } from '../../core/constants/inside.status.enum';
import type { InsideStatusDecisionValue } from '../../core/constants/inside.status.decision.enum';

type ResultWithError = {
  error?: {
    displayMessage?: string;
    title?: string;
  } | null;
};

const emptyValue = '-';

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const toPositiveInteger = (value: unknown): number | null => {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
};

export const useEmployeeTasks = () => {
  /**
   * لازم useRoute يكون هنا
   */
  const route = useRoute();

  const { t } = useI18n();

  const taskAssignmentController = TaskAssignmentController.getInstance();

  const employeeController = EmployeeController.getInstance();

  const currentTasksPage = ref(1);

  const tasksPerPage = ref(10);

  const updatingTasks = ref<Record<number, boolean>>({});

  const updatingInsideStatusItems = ref<Record<number, boolean>>({});

  const statusUpdateErrors = ref<Record<number, string>>({});

  /**
   * =========================================
   * Status from route
   *
   * ?status=1
   * ?status=2
   * ?status=3
   * ?status=4
   * =========================================
   */
  const selectedStatus = computed<InsideStatusType | undefined>(() => {
    const status = Number(route.query.status);

    if (
      status === InsideStatusType.ASSIGN ||
      status === InsideStatusType.WORKING ||
      status === InsideStatusType.HOLD ||
      status === InsideStatusType.REVIEW
    ) {
      return status;
    }

    return undefined;
  });

  const tasksFilters = reactive({
    employee_id: null as number | null,
  });

  const selectedEmployeeFilter = ref<TitleInterface<number> | null>(null);

  /**
   * =========================================
   * States
   * =========================================
   */
  const tasksState = computed(() => {
    return taskAssignmentController.employeeTasksState.value;
  });

  const tasksLoading = computed(() => {
    return tasksState.value instanceof DataLoading;
  });

  const employeesLoading = computed(() => {
    return employeeController.listState.value instanceof DataLoading;
  });

  /**
   * =========================================
   * Employee options
   * =========================================
   */
  const employeeOptions = computed<TitleInterface<number>[]>(() => {
    const state = employeeController.listState.value as {
      data?: unknown;
    };

    const data = state.data;

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((employee) => {
        const employeeRecord = toRecord(employee);

        const id = toPositiveInteger(employeeRecord?.id);

        if (!id) {
          return null;
        }

        return new TitleInterface<number>({
          id,

          title: String(employeeRecord?.name ?? employeeRecord?.title ?? `#${id}`),
        });
      })
      .filter((item): item is TitleInterface<number> => item !== null);
  });

  /**
   * =========================================
   * Pagination
   * =========================================
   */
  const tasksPagination = computed(() => {
    const pagination = tasksState.value.pagination;

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

  const tasksCount = computed(() => {
    if (tasksPagination.value) {
      return tasksPagination.value.total;
    }

    if (tasksState.value instanceof DataSuccess && Array.isArray(tasksState.value.data)) {
      return tasksState.value.data.length;
    }

    return 0;
  });

  /**
   * =========================================
   * Helpers
   * =========================================
   */
  const valueOrEmpty = (value?: string | number | null): string => {
    if (value === null || value === undefined || value === '') {
      return emptyValue;
    }

    return String(value);
  };

  const formatDate = (value?: string | null): string => {
    if (!value) {
      return emptyValue;
    }

    return value;
  };

  const taskRows = (data: unknown): TaskAssignmentEmployeeTaskModel[] => {
    return Array.isArray(data) ? (data as TaskAssignmentEmployeeTaskModel[]) : [];
  };

  const getResultMessage = (result: ResultWithError) => {
    return (
      result.error?.displayMessage || result.error?.title || t('task_assignment.unexpected_error')
    );
  };

  /**
   * =========================================
   * Fetch Tasks
   * =========================================
   */
  const fetchEmployeeTasks = async (page = currentTasksPage.value): Promise<void> => {
    currentTasksPage.value = page;

    const params = new FetchEmployeeTasksParams({
      pageNumber: page,

      perPage: tasksPerPage.value,

      employeeId: tasksFilters.employee_id ?? undefined,

      /**
       * أهم سطر
       */
      status: selectedStatus.value,
    });

    await taskAssignmentController.fetchEmployeeTasks(params);
  };

  /**
   * =========================================
   * Employee filter
   * =========================================
   */
  const onEmployeeFilterChange = (
    value: TitleInterface<number> | TitleInterface<number>[] | null,
  ): void => {
    const selected = Array.isArray(value) ? null : value;

    selectedEmployeeFilter.value = selected;

    tasksFilters.employee_id = selected ? Number(selected.id) : null;

    void fetchEmployeeTasks(1);
  };

  const clearEmployeeFilter = (): void => {
    onEmployeeFilterChange(null);
  };

  /**
   * =========================================
   * Task status
   * =========================================
   */
  const isTaskUpdating = (task: TaskAssignmentEmployeeTaskModel): boolean => {
    return Boolean(task.id && updatingTasks.value[task.id]);
  };

  const getTaskStatusValue = (task: TaskAssignmentEmployeeTaskModel): string => {
    return task.status === undefined || task.status === null ? '' : String(task.status);
  };

  const getStatusDisplay = (task: TaskAssignmentEmployeeTaskModel): string => {
    return task.statusLabel || valueOrEmpty(task.status ?? null);
  };

  const getStatusClass = (task: TaskAssignmentEmployeeTaskModel): string => {
    return task.status === undefined || task.status === null ? 'is-muted' : 'is-progress';
  };

  const getSelectedStatusPayload = (
    task: TaskAssignmentEmployeeTaskModel,

    selectedStatus: string,
  ): string | number => {
    return (
      task.availableStatuses.find((status) => String(status.id) === selectedStatus)?.id ??
      selectedStatus
    );
  };

  const isInsideStatusUpdating = (task: TaskAssignmentEmployeeTaskModel): boolean => {
    return Boolean(
      task.projectDepartmentItemId && updatingInsideStatusItems.value[task.projectDepartmentItemId],
    );
  };

  const setInsideStatusUpdating = (projectDepartmentItemId: number, isUpdating: boolean): void => {
    updatingInsideStatusItems.value = {
      ...updatingInsideStatusItems.value,
      [projectDepartmentItemId]: isUpdating,
    };
  };

  const changeInsideStatus = async (
    task: TaskAssignmentEmployeeTaskModel,
    status: InsideStatusDecisionValue,
  ): Promise<void> => {
    const projectDepartmentItemId = task.projectDepartmentItemId;

    if (!projectDepartmentItemId || isInsideStatusUpdating(task)) {
      return;
    }

    setInsideStatusUpdating(projectDepartmentItemId, true);

    try {
      const statusChange = await taskAssignmentController.changeInsideStatus(
        new ChangeInsideStatusParams({
          projectDepartmentItemId,
          status,
        }),
      );

      if (!(statusChange instanceof DataSuccess)) {
        dialogManager.toastError(getResultMessage(statusChange));
        return;
      }

      dialogManager.toastSuccess(statusChange.message || t('task_assignment.status_updated'));
      await fetchEmployeeTasks();
    } finally {
      setInsideStatusUpdating(projectDepartmentItemId, false);
    }
  };

  const changeTaskStatus = async (
    task: TaskAssignmentEmployeeTaskModel,

    selectedStatus: string,
  ): Promise<void> => {
    if (!task.id || !task.statusUpdateAction || isTaskUpdating(task)) {
      return;
    }

    if (!selectedStatus || selectedStatus === getTaskStatusValue(task)) {
      return;
    }

    updatingTasks.value = {
      ...updatingTasks.value,
      [task.id]: true,
    };

    statusUpdateErrors.value = {
      ...statusUpdateErrors.value,
      [task.id]: '',
    };

    try {
      const result = await taskAssignmentController.changeEmployeeTaskStatus(
        task.statusUpdateAction,
        {
          task_id: task.id,

          status: getSelectedStatusPayload(task, selectedStatus),
        },
      );

      if (result instanceof DataSuccess) {
        dialogManager.toastSuccess(result.message || t('task_assignment.status_updated'));

        await fetchEmployeeTasks();

        return;
      }

      statusUpdateErrors.value = {
        ...statusUpdateErrors.value,

        [task.id]: getResultMessage(result),
      };

      dialogManager.toastError(statusUpdateErrors.value[task.id] ?? '');
    } finally {
      updatingTasks.value = {
        ...updatingTasks.value,

        [task.id]: false,
      };
    }
  };

  /**
   * =========================================
   * Per page
   * =========================================
   */
  const onPerPageChange = (count: number): void => {
    tasksPerPage.value = count;

    void fetchEmployeeTasks(1);
  };

  /**
   * =========================================
   * Initialize
   * =========================================
   */
  const initializeEmployeeTasks = async (): Promise<void> => {
    await Promise.all([
      employeeController.fetchList(new IndexEmployeeParams('', 1, 100, 0)),

      fetchEmployeeTasks(1),
    ]);
  };

  onMounted(() => {
    void initializeEmployeeTasks();
  });

  /**
   * لما sidebar يغير:
   *
   * ?status=1
   * ↓
   * ?status=2
   *
   * نعمل request جديد page 1
   */
  watch(
    () => route.query.status,

    (newStatus, oldStatus) => {
      if (newStatus === oldStatus) {
        return;
      }

      currentTasksPage.value = 1;

      void fetchEmployeeTasks(1);
    },
  );

  return {
    selectedStatus,

    tasksFilters,

    selectedEmployeeFilter,

    employeeOptions,

    employeesLoading,

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

    changeInsideStatus,

    isTaskUpdating,

    isInsideStatusUpdating,

    getTaskStatusValue,

    getStatusDisplay,

    getStatusClass,

    onPerPageChange,

    onEmployeeFilterChange,

    clearEmployeeFilter,

    initializeEmployeeTasks,
  };
};
