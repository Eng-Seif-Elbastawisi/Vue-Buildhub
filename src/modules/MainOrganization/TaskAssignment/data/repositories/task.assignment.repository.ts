import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import {
  DataEmpty,
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import {
  ErrorModel,
  ErrorType,
} from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import PaginationModel from '@/base/Core/Models/paginationModel';
import type { ApiResponse } from '@/base/Data/ApiService/baseApiService';
import BaseRepository, {
  type RepositoryConfig,
} from '@/base/Domain/Repositories/baseRepository';

import { HttpStatusCode } from 'axios';

import TaskAssignmentEmployeeTaskModel from '../../core/models/task.assignment.employee-task.model';
import TaskAssignmentApprovedTaskModel from '../../core/models/task.assignment.approved-task.model';
import type FetchApprovedTasksParams from '../../core/params/fetch.approved.tasks.params';
import TaskAssignmentApiService from '../api/task.assignment.api-service';

interface TaskAssignmentActionResponse {
  status?: boolean;
  message?: string;
  data?: unknown;
  meta?: unknown;
  pagination?: unknown;
}

type TaskAssignmentActionParams =
  | Params
  | Record<string, unknown>;

export default class TaskAssignmentRepository extends BaseRepository<
  TaskAssignmentEmployeeTaskModel,
  TaskAssignmentEmployeeTaskModel[]
> {
  private static instance: TaskAssignmentRepository;

  protected get apiService(): TaskAssignmentApiService {
    return TaskAssignmentApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): TaskAssignmentEmployeeTaskModel {
    return TaskAssignmentEmployeeTaskModel.example;
  }

  protected get mockList(): TaskAssignmentEmployeeTaskModel[] {
    return [TaskAssignmentEmployeeTaskModel.example];
  }

  public static getInstance(): TaskAssignmentRepository {
    if (!TaskAssignmentRepository.instance) {
      TaskAssignmentRepository.instance =
        new TaskAssignmentRepository();
    }

    return TaskAssignmentRepository.instance;
  }

  protected parseItem(
    data: Record<string, unknown>,
  ): TaskAssignmentEmployeeTaskModel {
    return TaskAssignmentEmployeeTaskModel.fromJson(data);
  }

  protected parseList(
    data: unknown,
  ): TaskAssignmentEmployeeTaskModel[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter(
        (
          item,
        ): item is Record<string, unknown> =>
          Boolean(
            item &&
            typeof item === 'object' &&
            !Array.isArray(item),
          ),
      )
      .map((item) =>
        TaskAssignmentEmployeeTaskModel.fromJson(item),
      );
  }

  public async assignProjectDepartmentItemTask(
    params?: TaskAssignmentActionParams,
  ): Promise<DataState<void>> {
    return this.executeTaskAssignmentAction(() =>
      this.apiService.assignProjectDepartmentItemTask(
        params,
      ),
    );
  }

  public async fetchEmployeeTasks(
    params?: TaskAssignmentActionParams,
  ): Promise<
    DataState<TaskAssignmentEmployeeTaskModel[]>
  > {
    try {
      const response =
        await this.apiService.fetchEmployeeTasks(params);

      return this.processEmployeeTasksResponse(response);
    } catch (error) {
      return this.handleError<
        TaskAssignmentEmployeeTaskModel[]
      >(error);
    }
  }

  public async changeEmployeeTaskStatus(
    action: string,
    params?: TaskAssignmentActionParams,
  ): Promise<DataState<void>> {
    return this.executeTaskAssignmentAction(() =>
      this.apiService.changeEmployeeTaskStatus(
        action,
        params,
      ),
    );
  }

  public async setTaskEmployeeStatus(
    params?: TaskAssignmentActionParams,
  ): Promise<DataState<void>> {
    return this.executeTaskAssignmentAction(() =>
      this.apiService.setTaskEmployeeStatus(params),
    );
  }

  public async fetchApprovedTasks(
    params: FetchApprovedTasksParams,
  ): Promise<
    DataState<TaskAssignmentApprovedTaskModel[]>
  > {
    try {
      const response =
        await this.apiService.fetchApprovedTasks(params);

      return this.processApprovedTasksResponse(response);
    } catch (error) {
      return this.handleError<
        TaskAssignmentApprovedTaskModel[]
      >(error);
    }
  }

  private async executeTaskAssignmentAction(
    apiCall: () => Promise<
      ApiResponse<TaskAssignmentActionResponse>
    >,
  ): Promise<DataState<void>> {
    try {
      const response = await apiCall();

      return this.processTaskAssignmentActionResponse(
        response,
      );
    } catch (error) {
      return this.handleError<void>(error);
    }
  }

  private processTaskAssignmentActionResponse(
    response: ApiResponse<TaskAssignmentActionResponse>,
  ): DataState<void> {
    if (this.isSuccessfulResponse(response)) {
      return new DataSuccess<void>({
        message: response.data.message,
      });
    }

    return new DataFailed<void>({
      error: new ErrorModel(
        response.data.message ?? 'error.retry_later',
        ErrorType.serviceSide,
      ),
    });
  }

  private processEmployeeTasksResponse(
    response: ApiResponse<TaskAssignmentActionResponse>,
  ): DataState<TaskAssignmentEmployeeTaskModel[]> {
    if (!this.isSuccessfulResponse(response)) {
      return new DataFailed<
        TaskAssignmentEmployeeTaskModel[]
      >({
        error: new ErrorModel(
          response.data.message ?? 'error.retry_later',
          ErrorType.serviceSide,
        ),
      });
    }

    const responsePayload = response.data.data;
    const rows = this.extractEmployeeTaskRows(
      responsePayload,
    );

    if (!rows.length) {
      return new DataEmpty<
        TaskAssignmentEmployeeTaskModel[]
      >(
        new ErrorModel(
          response.data.message ?? 'no_data',
          ErrorType.dataEmpty,
        ),
      );
    }

    const tasks = rows
      .filter(
        (
          row,
        ): row is Record<string, unknown> =>
          Boolean(
            row &&
            typeof row === 'object' &&
            !Array.isArray(row),
          ),
      )
      .map((row) =>
        TaskAssignmentEmployeeTaskModel.fromJson(row),
      );

    return new DataSuccess<
      TaskAssignmentEmployeeTaskModel[]
    >({
      data: tasks,
      pagination:
        this.extractPagination(responsePayload),
      message: response.data.message,
    });
  }

  private processApprovedTasksResponse(
    response: ApiResponse<TaskAssignmentActionResponse>,
  ): DataState<TaskAssignmentApprovedTaskModel[]> {
    if (!this.isSuccessfulResponse(response)) {
      return new DataFailed<
        TaskAssignmentApprovedTaskModel[]
      >({
        error: new ErrorModel(
          response.data.message ?? 'error.retry_later',
          ErrorType.serviceSide,
        ),
      });
    }

    const rows = this.extractApprovedTaskRows(
      response.data.data,
    );

    if (!rows.length) {
      return new DataEmpty<
        TaskAssignmentApprovedTaskModel[]
      >(
        new ErrorModel(
          response.data.message ?? 'no_data',
          ErrorType.dataEmpty,
        ),
      );
    }

    const tasks = rows
      .filter(
        (
          row,
        ): row is Record<string, unknown> =>
          Boolean(
            row &&
            typeof row === 'object' &&
            !Array.isArray(row),
          ),
      )
      .map((row) =>
        TaskAssignmentApprovedTaskModel.fromJson(row),
      );

    if (!tasks.length) {
      return new DataEmpty<
        TaskAssignmentApprovedTaskModel[]
      >(
        new ErrorModel(
          response.data.message ?? 'no_data',
          ErrorType.dataEmpty,
        ),
      );
    }

    return new DataSuccess<
      TaskAssignmentApprovedTaskModel[]
    >({
      data: tasks,
      pagination:
        this.extractApprovedTasksPagination(response),
      message: response.data.message,
    });
  }

  private isSuccessfulResponse(
    response: ApiResponse<TaskAssignmentActionResponse>,
  ): boolean {
    const successCodes: number[] = [
      HttpStatusCode.Ok,
      HttpStatusCode.Created,
      HttpStatusCode.Accepted,
    ];

    return (
      successCodes.includes(response.statusCode) &&
      (response.data.status ?? true)
    );
  }

  private extractEmployeeTaskRows(
    responsePayload: unknown,
  ): unknown[] {
    if (Array.isArray(responsePayload)) {
      return responsePayload;
    }

    if (
      !responsePayload ||
      typeof responsePayload !== 'object' ||
      Array.isArray(responsePayload)
    ) {
      return [];
    }

    const payload =
      responsePayload as Record<string, unknown>;

    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload.tasks)) {
      return payload.tasks;
    }

    if (Array.isArray(payload.employee_tasks)) {
      return payload.employee_tasks;
    }

    return [];
  }

  private extractApprovedTaskRows(
    responsePayload: unknown,
  ): unknown[] {
    if (Array.isArray(responsePayload)) {
      return responsePayload;
    }

    if (
      !responsePayload ||
      typeof responsePayload !== 'object' ||
      Array.isArray(responsePayload)
    ) {
      return [];
    }

    const payload =
      responsePayload as Record<string, unknown>;

    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload.tasks)) {
      return payload.tasks;
    }

    if (Array.isArray(payload.approved_tasks)) {
      return payload.approved_tasks;
    }

    return [];
  }

  private extractPagination(
    responsePayload: unknown,
  ): PaginationModel | null {
    if (
      !responsePayload ||
      typeof responsePayload !== 'object' ||
      Array.isArray(responsePayload)
    ) {
      return null;
    }

    const payload =
      responsePayload as Record<string, unknown>;

    const pagination =
      payload.meta ?? payload.pagination;

    if (
      !pagination ||
      typeof pagination !== 'object' ||
      Array.isArray(pagination)
    ) {
      return null;
    }

    return PaginationModel.fromMap(
      pagination as Parameters<
        typeof PaginationModel.fromMap
      >[0],
    );
  }

  private extractApprovedTasksPagination(
    response: ApiResponse<TaskAssignmentActionResponse>,
  ): PaginationModel | null {
    const topLevelPagination =
      response.data.meta ??
      response.data.pagination;

    if (
      topLevelPagination &&
      typeof topLevelPagination === 'object' &&
      !Array.isArray(topLevelPagination)
    ) {
      return PaginationModel.fromMap(
        topLevelPagination as Parameters<
          typeof PaginationModel.fromMap
        >[0],
      );
    }

    return this.extractPagination(response.data.data);
  }
}