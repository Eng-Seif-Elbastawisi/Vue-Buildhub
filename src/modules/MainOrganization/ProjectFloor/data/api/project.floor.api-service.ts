import type AddProjectFloorSpacesParams from '../../core/params/add.project.floor.spaces.params';
import { CrudType } from '@/base/Data/ApiService/apiServiceInterface';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
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

  async addSpaces(params: AddProjectFloorSpacesParams) {
    if (!params.validate().isValid) throw new ValidationException('site_team.invalid_form');
    return this.custom<unknown>(
      { url: this.projectFloorEndpoints.addSpaces, method: CrudType.POST, params },
      { auth: true, useJson: true, usePost: true, useStaticData: false, enableRetry: false },
      false,
    );
  }

  async getProject(params?: Params) {
    return await this.customPost(this.projectFloorEndpoints.getProject, params);
  }
}
