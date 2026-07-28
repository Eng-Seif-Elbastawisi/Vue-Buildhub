import type Params from '@/base/Core/Params/params';
import BaseApiService, { CrudType, type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { TaskAssignmentApiEndpoints } from './task.assignment.api.endpoints';

type TaskAssignmentActionParams = Params | Record<string, unknown>;

export default class TaskAssignmentApiService extends BaseApiService {
  private static instance: TaskAssignmentApiService;
  private readonly taskAssignmentEndpoints = new TaskAssignmentApiEndpoints();

  static getInstance(): TaskAssignmentApiService {
    if (!TaskAssignmentApiService.instance) {
      TaskAssignmentApiService.instance = new TaskAssignmentApiService();
    }

    return TaskAssignmentApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {};
  }

  async assignProjectDepartmentItemTask(params?: TaskAssignmentActionParams) {
    return await this.customPost(
      this.taskAssignmentEndpoints.assignProjectDepartmentItemTask,
      params as Params,
    );
  }

  async fetchEmployeeTasks(params?: TaskAssignmentActionParams) {
    return await this.customPost(this.taskAssignmentEndpoints.fetchEmployeeTasks, params as Params);
  }

  async changeEmployeeTaskStatus(action: string, params?: TaskAssignmentActionParams) {
    return await this.customPost(
      this.taskAssignmentEndpoints.taskStatusAction(action),
      params as Params,
    );
  }

  async setTaskEmployeeStatus(params?: TaskAssignmentActionParams) {
    return await this.custom({
      url: this.taskAssignmentEndpoints.setTaskEmployeeStatus,
      method: CrudType.FormData,
      params: params as Params,
    });
  }
}
