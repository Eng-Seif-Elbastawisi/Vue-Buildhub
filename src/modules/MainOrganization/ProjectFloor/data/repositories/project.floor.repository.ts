import type AddProjectFloorSpacesParams from '../../core/params/add.project.floor.spaces.params';
import {
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import type Params from '@/base/Core/Params/params';
import ProjectFloorModel from '../../core/models/project.floor.model';
import ProjectFloorShowModel from '../../core/models/project.floor.show.model';
import ProjectFloorApiService from '../api/project.floor.api-service';

export default class ProjectFloorRepository extends BaseRepository<
  ProjectFloorShowModel,
  ProjectFloorModel[]
> {
  private static instance: ProjectFloorRepository;
  protected get apiService() {
    return ProjectFloorApiService.getInstance();
  }
  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }
  protected get mockItem() {
    return ProjectFloorShowModel.example;
  }
  protected get mockList() {
    return [ProjectFloorModel.example];
  }

  static getInstance(): ProjectFloorRepository {
    if (!ProjectFloorRepository.instance)
      ProjectFloorRepository.instance = new ProjectFloorRepository();
    return ProjectFloorRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): ProjectFloorShowModel {
    return ProjectFloorShowModel.fromJson(data);
  }
  protected parseList(data: unknown): ProjectFloorModel[] {
    return Array.isArray(data) ? data.map((item) => ProjectFloorModel.fromJson(item)) : [];
  }

  async addSpaces(params: AddProjectFloorSpacesParams): Promise<DataState<void>> {
    try {
      const response = await this.apiService.addSpaces(params);
      const body = response.data;
      if (
        response.statusCode < 200 ||
        response.statusCode >= 300 ||
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body)
      )
        throw new Error('site_team.invalid_response');
      const envelope = body as Record<string, unknown>;
      if (envelope.status !== true)
        throw new Error(
          typeof envelope.message === 'string' ? envelope.message : 'site_team.invalid_response',
        );
      return new DataSuccess<void>({});
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  async getProject(params?: Params) {
    return await this.apiService.getProject(params);
  }
}
