import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import SpecializationModel from '../../core/models/specialization.model';
import SpecializationShowModel from '../../core/models/specialization.show.model';
import SpecializationApiService from '../api/specialization.api-service';

export default class SpecializationRepository extends BaseRepository<
  SpecializationShowModel,
  SpecializationModel[]
> {
  private static instance: SpecializationRepository;
  protected get apiService() {
    return SpecializationApiService.getInstance();
  }
  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }
  protected get mockItem() {
    return SpecializationShowModel.example;
  }
  protected get mockList() {
    return [SpecializationModel.example];
  }

  static getInstance(): SpecializationRepository {
    if (!SpecializationRepository.instance)
      SpecializationRepository.instance = new SpecializationRepository();
    return SpecializationRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): SpecializationShowModel {
    return SpecializationShowModel.fromJson(data);
  }
  protected parseList(data: unknown): SpecializationModel[] {
    return Array.isArray(data) ? data.map((item) => SpecializationModel.fromJson(item)) : [];
  }
}
