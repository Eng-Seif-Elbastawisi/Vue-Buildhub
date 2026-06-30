import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ProjectItemApiService from '../api/project.Item.api-service';
import ProjectItemModel from '../../core/models/project.Item.model';
import ProjectItemShowModel from '../../core/models/project.Item.show.model';

export default class ProjectItemRepository extends BaseRepository<
  ProjectItemShowModel,
  ProjectItemModel[]
> {
  private static instance: ProjectItemRepository;

  protected get apiService() {
    return ProjectItemApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): ProjectItemShowModel {
    return ProjectItemShowModel.example;
  }

  protected get mockList(): ProjectItemModel[] {
    return [{ ...ProjectItemModel.example }, { ...ProjectItemModel.example }];
  }

  static getInstance(): ProjectItemRepository {
    if (!ProjectItemRepository.instance) {
      ProjectItemRepository.instance = new ProjectItemRepository();
    }
    return ProjectItemRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): ProjectItemShowModel {
    return ProjectItemShowModel.fromJson(data);
  }

  protected parseList(data: unknown): ProjectItemModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => ProjectItemModel.fromJson(item));
  }
}
