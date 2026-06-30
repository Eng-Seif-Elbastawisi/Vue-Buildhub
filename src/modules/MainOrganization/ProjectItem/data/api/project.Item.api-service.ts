import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ProjectItemApiEndpoints } from './project.Item.api.endpoints';

export default class ProjectItemApiService extends BaseApiService {
  private static instance: ProjectItemApiService;

  private readonly projectEndpoints = new ProjectItemApiEndpoints();

  static getInstance(): ProjectItemApiService {
    if (!ProjectItemApiService.instance) {
      ProjectItemApiService.instance = new ProjectItemApiService();
    }
    return ProjectItemApiService.instance;
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
}
