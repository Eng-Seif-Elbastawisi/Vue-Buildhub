import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
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

  async getProject(params?: Record<string, unknown>) {
    return await this.apiService.getProject(params as any);
  }
}
