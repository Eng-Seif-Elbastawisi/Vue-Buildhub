import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import {
  DataFailed,
  DataInitial,
  DataLoading,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ErrorModel } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import { ref, type Ref } from 'vue';
import type TaskAssignmentEmployeeTaskModel from '../../core/models/task.assignment.employee-task.model';
import TaskAssignmentRepository from '../../data/repositories/task.assignment.repository';
import type TaskAssignmentApprovedTaskModel from '../../core/models/task.assignment.approved-task.model';
import type FetchApprovedTasksParams from '../../core/params/fetch.approved.tasks.params';

type TaskAssignmentActionParams = Params | Record<string, unknown>;

export default class TaskAssignmentController extends BaseController<
  TaskAssignmentEmployeeTaskModel,
  TaskAssignmentEmployeeTaskModel[]
> {
  private static instance: TaskAssignmentController;
  public employeeTasksState: Ref<DataState<TaskAssignmentEmployeeTaskModel[]>> = ref(
    new DataInitial<TaskAssignmentEmployeeTaskModel[]>(null),
  ) as Ref<DataState<TaskAssignmentEmployeeTaskModel[]>>;
  public approvedTasksState: Ref<DataState<TaskAssignmentApprovedTaskModel[]>> = ref(
    new DataInitial<TaskAssignmentApprovedTaskModel[]>(null),
  ) as Ref<DataState<TaskAssignmentApprovedTaskModel[]>>;

  protected get repository() {
    return TaskAssignmentRepository.getInstance();
  }

  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: false,
      showSuccessDialog: false,
      showErrorDialog: false,
      showErrorTosat: true,
      showSuccessTosat: true,
      autoRetry: false,
      maxAutoRetries: 1,
    };
  }

  private constructor() {
    super();
  }

  static getInstance(): TaskAssignmentController {
    if (!TaskAssignmentController.instance) {
      TaskAssignmentController.instance = new TaskAssignmentController();
    }

    return TaskAssignmentController.instance;
  }

  private handleTaskAssignmentActionResponse<T>(result: DataState<T>): DataState<T> {
    if (result.hasError) {
      this.handleErrorResponse(result);
    }

    return result;
  }

  async assignTask(params?: TaskAssignmentActionParams): Promise<DataState<void>> {
    const result = await this.repository.assignProjectDepartmentItemTask(params);

    return this.handleTaskAssignmentActionResponse(result);
  }

  async assignProjectDepartmentItemTask(
    params?: TaskAssignmentActionParams,
  ): Promise<DataState<void>> {
    return this.assignTask(params);
  }

  async fetchEmployeeTasks(
    params?: TaskAssignmentActionParams,
  ): Promise<DataState<TaskAssignmentEmployeeTaskModel[]>> {
    this.employeeTasksState.value = new DataLoading<TaskAssignmentEmployeeTaskModel[]>();

    try {
      const result = await this.repository.fetchEmployeeTasks(params);
      this.employeeTasksState.value = result;

      if (result.hasError) {
        this.handleErrorResponse(result);
      }

      return result;
    } catch (error) {
      const failed = new DataFailed<TaskAssignmentEmployeeTaskModel[]>({
        error: error as ErrorModel,
      });
      this.employeeTasksState.value = failed;
      this.handleErrorResponse(failed);

      return failed;
    }
  }

  async changeEmployeeTaskStatus(
    action: string,
    params?: TaskAssignmentActionParams,
  ): Promise<DataState<void>> {
    const result = await this.repository.changeEmployeeTaskStatus(action, params);

    return this.handleTaskAssignmentActionResponse(result);
  }

  async setTaskEmployeeStatus(params?: TaskAssignmentActionParams): Promise<DataState<void>> {
    const result = await this.repository.setTaskEmployeeStatus(params);

    return this.handleTaskAssignmentActionResponse(result);
  }

  async fetchApprovedTasks(
    params: FetchApprovedTasksParams,
  ): Promise<DataState<TaskAssignmentApprovedTaskModel[]>> {
    this.approvedTasksState.value = new DataLoading<TaskAssignmentApprovedTaskModel[]>();

    try {
      const approvedTasks = await this.repository.fetchApprovedTasks(params);
      this.approvedTasksState.value = approvedTasks;

      if (approvedTasks.hasError) {
        this.handleErrorResponse(approvedTasks);
      }

      return approvedTasks;
    } catch (error) {
      const failed = new DataFailed<TaskAssignmentApprovedTaskModel[]>({
        error: error as ErrorModel,
      });
      this.approvedTasksState.value = failed;
      this.handleErrorResponse(failed);

      return failed;
    }
  }
}
