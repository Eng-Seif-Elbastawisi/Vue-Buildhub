import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ProjectTypeModel from '../../core/models/project-type.model';
import ProjectTypeShowModel from '../../core/models/project-type.show.model';
import ProjectTypeApiService from '../api/project-type.api-service';

export default class ProjectTypeRepository extends BaseRepository<
  ProjectTypeShowModel,
  ProjectTypeModel[]
> {
  private static instance: ProjectTypeRepository;
  protected get apiService() {
    return ProjectTypeApiService.getInstance();
  }
  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }
  protected get mockItem() {
    return ProjectTypeShowModel.example;
  }
  protected get mockList() {
    return [ProjectTypeModel.example];
  }

  static getInstance(): ProjectTypeRepository {
    if (!ProjectTypeRepository.instance)
      ProjectTypeRepository.instance = new ProjectTypeRepository();
    return ProjectTypeRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): ProjectTypeShowModel {
    return ProjectTypeShowModel.fromJson(data);
  }
  protected parseList(data: unknown): ProjectTypeModel[] {
    return Array.isArray(data) ? data.map((item) => ProjectTypeModel.fromJson(item)) : [];
  }
}
