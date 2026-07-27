import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  DataLoading,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
import FetchEmployeeTasksParams from '../../core/params/fetch.employee.tasks.params';
import type TaskAssignmentEmployeeTaskModel from '../../core/models/task.assignment.employee-task.model';
import TaskAssignmentController from '../controllers/task.assignment.controller';
import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';
import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
import TitleInterface from '@/base/Data/Models/titleInterface';

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
  const { t } = useI18n();
  const taskAssignmentController = TaskAssignmentController.getInstance();
  const employeeController = EmployeeController.getInstance();
  const currentTasksPage = ref(1);
  const tasksPerPage = ref(10);
  const updatingTasks = ref<Record<number, boolean>>({});
  const statusUpdateErrors = ref<Record<number, string>>({});

  const tasksFilters = reactive({
    employee_id: null as number | null,
  });
  const selectedEmployeeFilter = ref<TitleInterface<number> | null>(null);

  const tasksState = computed(() => taskAssignmentController.employeeTasksState.value);
  const tasksLoading = computed(() => tasksState.value instanceof DataLoading);
  const employeesLoading = computed(
    () => employeeController.listState.value instanceof DataLoading,
  );

  const employeeOptions = computed<TitleInterface<number>[]>(() => {
    const state = employeeController.listState.value as { data?: unknown };
    const data = state.data;

    if (!Array.isArray(data)) return [];

    return data
      .map((employee) => {
        const employeeRecord = toRecord(employee);
        const id = toPositiveInteger(employeeRecord?.id);
        if (!id) return null;

        return new TitleInterface<number>({
          id,
          title: String(employeeRecord?.name ?? employeeRecord?.title ?? `#${id}`),
        });
      })
      .filter((item): item is TitleInterface<number> => item !== null);
  });

  const tasksPagination = computed(() => {
    const pagination = tasksState.value.pagination;

    if (!pagination) return null;

    return {
      current: pagination.currentPage,
      last: pagination.lastPage,
      next: pagination.to,
      total: pagination.total,
      count: pagination.perPage,
    };
  });

  const tasksCount = computed(() => {
    if (tasksPagination.value) return tasksPagination.value.total;

    if (tasksState.value instanceof DataSuccess && Array.isArray(tasksState.value.data)) {
      return tasksState.value.data.length;
    }

    return 0;
  });

  const valueOrEmpty = (value?: string | number | null): string => {
    if (value === null || value === undefined || value === '') return emptyValue;

    return String(value);
  };

  const formatDate = (value?: string | null): string => {
    if (!value) return emptyValue;

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

  const fetchEmployeeTasks = async (page = currentTasksPage.value): Promise<void> => {
    currentTasksPage.value = page;

    await taskAssignmentController.fetchEmployeeTasks(
      new FetchEmployeeTasksParams({
        pageNumber: page,
        perPage: tasksPerPage.value,
        employeeId: tasksFilters.employee_id ?? undefined,
      }),
    );
  };

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

  const changeTaskStatus = async (
    task: TaskAssignmentEmployeeTaskModel,
    selectedStatus: string,
  ): Promise<void> => {
    if (!task.id || !task.statusUpdateAction || isTaskUpdating(task)) return;
    if (!selectedStatus || selectedStatus === getTaskStatusValue(task)) return;

    updatingTasks.value = { ...updatingTasks.value, [task.id]: true };
    statusUpdateErrors.value = { ...statusUpdateErrors.value, [task.id]: '' };

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
      updatingTasks.value = { ...updatingTasks.value, [task.id]: false };
    }
  };

  const onPerPageChange = (count: number): void => {
    tasksPerPage.value = count;
    void fetchEmployeeTasks(1);
  };

  const initializeEmployeeTasks = async (): Promise<void> => {
    await Promise.all([
      employeeController.fetchList(new IndexEmployeeParams('', 1, 100, 0)),
      fetchEmployeeTasks(1),
    ]);
  };

  onMounted(() => {
    void initializeEmployeeTasks();
  });

  return {
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
    isTaskUpdating,
    getTaskStatusValue,
    getStatusDisplay,
    getStatusClass,
    onPerPageChange,
    onEmployeeFilterChange,
    clearEmployeeFilter,
    initializeEmployeeTasks,
  };
};
