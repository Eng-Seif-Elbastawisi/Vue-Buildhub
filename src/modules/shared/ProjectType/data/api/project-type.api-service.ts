import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ProjectTypeApiEndpoints } from './project-type.api.endpoints';

export default class ProjectTypeApiService extends BaseApiService {
  private static instance: ProjectTypeApiService;
  private readonly projectTypeEndpoints = new ProjectTypeApiEndpoints();

  static getInstance(): ProjectTypeApiService {
    if (!ProjectTypeApiService.instance)
      ProjectTypeApiService.instance = new ProjectTypeApiService();
    return ProjectTypeApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.projectTypeEndpoints.index,
      show: this.projectTypeEndpoints.show,
      create: this.projectTypeEndpoints.store,
      update: this.projectTypeEndpoints.update,
      delete: this.projectTypeEndpoints.delete,
    };
  }
}
