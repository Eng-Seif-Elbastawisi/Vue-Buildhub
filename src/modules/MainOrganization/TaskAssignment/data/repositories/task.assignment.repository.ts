import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import {
  DataEmpty,
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type { ApiResponse } from '@/base/Data/ApiService/baseApiService';
import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import PaginationModel from '@/base/Core/Models/paginationModel';
import { HttpStatusCode } from 'axios';
import TaskAssignmentEmployeeTaskModel from '../../core/models/task.assignment.employee-task.model';
import TaskAssignmentApiService from '../api/task.assignment.api-service';

type TaskAssignmentActionResponse = {
  status?: boolean;
  message?: string;
  data?: unknown;
};
type TaskAssignmentActionParams = Params | Record<string, unknown>;

export default class TaskAssignmentRepository extends BaseRepository<
  TaskAssignmentEmployeeTaskModel,
  TaskAssignmentEmployeeTaskModel[]
> {
  private static instance: TaskAssignmentRepository;

  protected get apiService() {
    return TaskAssignmentApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }

  protected get mockItem() {
    return TaskAssignmentEmployeeTaskModel.example;
  }

  protected get mockList() {
    return [TaskAssignmentEmployeeTaskModel.example];
  }

  static getInstance(): TaskAssignmentRepository {
    if (!TaskAssignmentRepository.instance) {
      TaskAssignmentRepository.instance = new TaskAssignmentRepository();
    }

    return TaskAssignmentRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): TaskAssignmentEmployeeTaskModel {
    return TaskAssignmentEmployeeTaskModel.fromJson(data);
  }

  protected parseList(data: unknown): TaskAssignmentEmployeeTaskModel[] {
    return Array.isArray(data)
      ? data.map((item) => TaskAssignmentEmployeeTaskModel.fromJson(item))
      : [];
  }

  private processTaskAssignmentActionResponse(
    response: ApiResponse<TaskAssignmentActionResponse>,
  ): DataState<void> {
    const isSuccess =
      [HttpStatusCode.Ok, HttpStatusCode.Created, HttpStatusCode.Accepted].includes(
        response.statusCode,
      ) &&
      (response.data.status ?? true);

    if (isSuccess) {
      return new DataSuccess<void>({
        message: response.data.message,
      });
    }

    return new DataFailed({
      error: new ErrorModel(response.data.message ?? 'error.retry_later', ErrorType.serviceSide),
    });
  }

  private async executeTaskAssignmentAction(
    apiCall: () => Promise<ApiResponse<TaskAssignmentActionResponse>>,
  ): Promise<DataState<void>> {
    try {
      return this.processTaskAssignmentActionResponse(await apiCall());
    } catch (error) {
      return this.handleError<void>(error);
    }
  }

  private extractEmployeeTaskRows(responsePayload: unknown): unknown[] {
    if (Array.isArray(responsePayload)) return responsePayload;

    if (responsePayload && typeof responsePayload === 'object') {
      const taskPayload = responsePayload as Record<string, unknown>;

      if (Array.isArray(taskPayload.data)) return taskPayload.data;
      if (Array.isArray(taskPayload.tasks)) return taskPayload.tasks;
      if (Array.isArray(taskPayload.employee_tasks)) return taskPayload.employee_tasks;
    }

    return [];
  }

  private extractEmployeeTasksPagination(responsePayload: unknown): PaginationModel | null {
    if (!responsePayload || typeof responsePayload !== 'object') return null;

    const taskPayload = responsePayload as Record<string, unknown>;
    const meta = taskPayload.meta ?? taskPayload.pagination;

    return meta && typeof meta === 'object'
      ? PaginationModel.fromMap(meta as Parameters<typeof PaginationModel.fromMap>[0])
      : null;
  }

  private processEmployeeTasksResponse(
    response: ApiResponse<TaskAssignmentActionResponse>,
  ): DataState<TaskAssignmentEmployeeTaskModel[]> {
    const isSuccess =
      [HttpStatusCode.Ok, HttpStatusCode.Created, HttpStatusCode.Accepted].includes(
        response.statusCode,
      ) &&
      (response.data.status ?? true);

    if (!isSuccess) {
      return new DataFailed({
        error: new ErrorModel(response.data.message ?? 'error.retry_later', ErrorType.serviceSide),
      });
    }

    const responsePayload = response.data.data;

    if (responsePayload == null) {
      return new DataEmpty<TaskAssignmentEmployeeTaskModel[]>(
        new ErrorModel(response.data.message ?? 'no_data', ErrorType.dataEmpty),
      );
    }

    const rows = this.extractEmployeeTaskRows(responsePayload);
    const pagination = this.extractEmployeeTasksPagination(responsePayload);

    return new DataSuccess<TaskAssignmentEmployeeTaskModel[]>({
      data: rows
        .map((taskRow) =>
          taskRow && typeof taskRow === 'object'
            ? TaskAssignmentEmployeeTaskModel.fromJson(taskRow as Record<string, unknown>)
            : null,
        )
        .filter((taskRow): taskRow is TaskAssignmentEmployeeTaskModel => taskRow !== null),
      pagination,
      message: response.data.message,
    });
  }

  async assignProjectDepartmentItemTask(
    params?: TaskAssignmentActionParams,
  ): Promise<DataState<void>> {
    return await this.executeTaskAssignmentAction(() =>
      this.apiService.assignProjectDepartmentItemTask(params),
    );
  }

  async fetchEmployeeTasks(
    params?: TaskAssignmentActionParams,
  ): Promise<DataState<TaskAssignmentEmployeeTaskModel[]>> {
    try {
      return this.processEmployeeTasksResponse(await this.apiService.fetchEmployeeTasks(params));
    } catch (error) {
      return this.handleError<TaskAssignmentEmployeeTaskModel[]>(error);
    }
  }

  async changeEmployeeTaskStatus(
    action: string,
    params?: TaskAssignmentActionParams,
  ): Promise<DataState<void>> {
    return await this.executeTaskAssignmentAction(() =>
      this.apiService.changeEmployeeTaskStatus(action, params),
    );
  }
}
