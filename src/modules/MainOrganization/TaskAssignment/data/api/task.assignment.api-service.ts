import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { TaskAssignmentApiEndpoints } from './task.assignment.api.endpoints';

export default class TaskAssignmentApiService extends BaseApiService {
  private static instance: TaskAssignmentApiService;
  private readonly taskAssignmentEndpoints = new TaskAssignmentApiEndpoints();

  static getInstance(): TaskAssignmentApiService {
    if (!TaskAssignmentApiService.instance)
      TaskAssignmentApiService.instance = new TaskAssignmentApiService();
    return TaskAssignmentApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      // index: this.taskAssignmentEndpoints.fetchApprovedTasks,
      // show: this.taskAssignmentEndpoints.show,
      // create: this.taskAssignmentEndpoints.store,
      // update: this.taskAssignmentEndpoints.update,
      // delete: this.taskAssignmentEndpoints.delete,
    };
  }

  async getProject(params?: Params) {
    return await this.customPost(this.taskAssignmentEndpoints.fetchApprovedTasks, params);
  }

  async fetchApprovedTasks(params?: Params) {
    return await this.customPost(this.taskAssignmentEndpoints.fetchApprovedTasks, params);
  }

  async setTaskEmployeeStatus(params?: TaskAssignmentActionParams) {
    return await this.customPost(
      this.taskAssignmentEndpoints.setTaskEmployeeStatus,
      params as Params,
    );
  }
}
