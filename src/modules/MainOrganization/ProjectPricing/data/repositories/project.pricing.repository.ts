import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ProjectPricingApiService from '../api/project.pricing.api-service';
import ProjectPricingModel from '../../core/models/project.pricing.model';
import ProjectPricingShowModel from '../../core/models/project.pricing.show.model';

export default class ProjectPricingRepository extends BaseRepository<
  ProjectPricingShowModel,
  ProjectPricingModel[]
> {
  private static instance: ProjectPricingRepository;

  protected get apiService() {
    return ProjectPricingApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): ProjectPricingShowModel {
    return ProjectPricingShowModel.example;
  }

  protected get mockList(): ProjectPricingModel[] {
    return [{ ...ProjectPricingModel.example }, { ...ProjectPricingModel.example }];
  }

  static getInstance(): ProjectPricingRepository {
    if (!ProjectPricingRepository.instance) {
      ProjectPricingRepository.instance = new ProjectPricingRepository();
    }
    return ProjectPricingRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): ProjectPricingShowModel {
    return ProjectPricingShowModel.fromJson(data);
  }

  protected parseList(data: unknown): ProjectPricingModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => ProjectPricingModel.fromJson(item));
  }
}
