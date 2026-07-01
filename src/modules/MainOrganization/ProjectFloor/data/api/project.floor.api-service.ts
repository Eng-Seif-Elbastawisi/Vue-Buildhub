import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ProjectFloorApiEndpoints } from './project.floor.api.endpoints';

export default class ProjectFloorApiService extends BaseApiService {
  private static instance: ProjectFloorApiService;
  private readonly projectFloorEndpoints = new ProjectFloorApiEndpoints();

  static getInstance(): ProjectFloorApiService {
    if (!ProjectFloorApiService.instance)
      ProjectFloorApiService.instance = new ProjectFloorApiService();
    return ProjectFloorApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.projectFloorEndpoints.index,
      show: this.projectFloorEndpoints.show,
      create: this.projectFloorEndpoints.store,
      update: this.projectFloorEndpoints.update,
      delete: this.projectFloorEndpoints.delete,
    };
  }

  async getProject(params?: Record<string, unknown>) {
    return await this.customPost(this.projectFloorEndpoints.getProject, params as any);
  }
}
