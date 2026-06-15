import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ProjectApiEndpoints } from './project.api.endpoints';

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
}
