import type Params from '@/base/Core/Params/params';
import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ProjectApiEndpoints } from './project.api.endpoints';

type ProjectActionParams = Params | Record<string, unknown>;

export default class ProjectApiService extends BaseApiService {
  private static instance: ProjectApiService;
  private readonly projectEndpoints = new ProjectApiEndpoints();

  static getInstance(): ProjectApiService {
    if (!ProjectApiService.instance) ProjectApiService.instance = new ProjectApiService();
    return ProjectApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.projectEndpoints.index,
      show: this.projectEndpoints.show,
      create: this.projectEndpoints.store,
      update: this.projectEndpoints.update,
      delete: this.projectEndpoints.delete,
    };
  }

  async convertMeasurementToProject(params?: ProjectActionParams) {
    return await this.customPost(
      this.projectEndpoints.convertMeasurementToProject,
      params as Params,
    );
  }

  async storeVersion(params?: ProjectActionParams) {
    return await this.customPost(this.projectEndpoints.storeVersion, params as Params);
  }

  async reviseVersion(params?: ProjectActionParams) {
    return await this.customPost(this.projectEndpoints.reviseVersion, params as Params);
  }

  async changeProjectStatus(params?: ProjectActionParams) {
    return await this.customPost(this.projectEndpoints.changeProjectStatus, params as Params);
  }

  async fetchProjectStatusHistories(params?: ProjectActionParams) {
    return await this.customPost(
      this.projectEndpoints.fetchProjectStatusHistories,
      params as Params,
    );
  }
}
