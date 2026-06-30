import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ProjectPreviewApiEndpoints } from './project.preview.api.endpoints';

export default class ProjectPreviewApiService extends BaseApiService {
  private static instance: ProjectPreviewApiService;
  private readonly projectPreviewEndpoints = new ProjectPreviewApiEndpoints();

  static getInstance(): ProjectPreviewApiService {
    if (!ProjectPreviewApiService.instance)
      ProjectPreviewApiService.instance = new ProjectPreviewApiService();
    return ProjectPreviewApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.projectPreviewEndpoints.index,
      show: this.projectPreviewEndpoints.show,
      create: this.projectPreviewEndpoints.store,
      update: this.projectPreviewEndpoints.update,
      delete: this.projectPreviewEndpoints.delete,
      

    };
  }
}
