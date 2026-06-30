import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ProjectPreviewModel from '../../core/models/project.preview.model';
import ProjectPreviewShowModel from '../../core/models/project.preview.show.model';
import ProjectPreviewApiService from '../api/project.preview.api-service';

export default class ProjectPreviewRepository extends BaseRepository<
  ProjectPreviewShowModel,
  ProjectPreviewModel[]
> {
  private static instance: ProjectPreviewRepository;
  protected get apiService() {
    return ProjectPreviewApiService.getInstance();
  }
  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }
  protected get mockItem() {
    return ProjectPreviewShowModel.example;
  }
  protected get mockList() {
    return [ProjectPreviewModel.example];
  }

  static getInstance(): ProjectPreviewRepository {
    if (!ProjectPreviewRepository.instance)
      ProjectPreviewRepository.instance = new ProjectPreviewRepository();
    return ProjectPreviewRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): ProjectPreviewShowModel {
    return ProjectPreviewShowModel.fromJson(data);
  }
  protected parseList(data: unknown): ProjectPreviewModel[] {
    return Array.isArray(data) ? data.map((item) => ProjectPreviewModel.fromJson(item)) : [];
  }
}
