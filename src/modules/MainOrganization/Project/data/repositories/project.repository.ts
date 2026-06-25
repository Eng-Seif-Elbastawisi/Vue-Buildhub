import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ProjectModel from '../../core/models/project.model';
import ProjectShowModel from '../../core/models/project.show.model';
import ProjectApiService from '../api/project.api-service';

export default class ProjectRepository extends BaseRepository<
  ProjectShowModel,
  ProjectModel[]
> {
  private static instance: ProjectRepository;
  protected get apiService() {
    return ProjectApiService.getInstance();
  }
  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }
  protected get mockItem() {
    return ProjectShowModel.example;
  }
  protected get mockList() {
    return [ProjectModel.example];
  }

  static getInstance(): ProjectRepository {
    if (!ProjectRepository.instance)
      ProjectRepository.instance = new ProjectRepository();
    return ProjectRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): ProjectShowModel {
    return ProjectShowModel.fromJson(data);
  }
  protected parseList(data: unknown): ProjectModel[] {
    return Array.isArray(data) ? data.map((item) => ProjectModel.fromJson(item)) : [];
  }
}
