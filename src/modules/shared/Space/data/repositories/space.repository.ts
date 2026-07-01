import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import SpaceModel from '../../core/models/space.model';
import SpaceShowModel from '../../core/models/space.show.model';
import SpaceApiService from '../api/space.api-service';

export default class SpaceRepository extends BaseRepository<SpaceShowModel, SpaceModel[]> {
  private static instance: SpaceRepository;
  protected get apiService() {
    return SpaceApiService.getInstance();
  }
  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }
  protected get mockItem() {
    return SpaceShowModel.example;
  }
  protected get mockList() {
    return [SpaceModel.example];
  }

  static getInstance(): SpaceRepository {
    if (!SpaceRepository.instance) SpaceRepository.instance = new SpaceRepository();
    return SpaceRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): SpaceShowModel {
    return SpaceShowModel.fromJson(data);
  }
  protected parseList(data: unknown): SpaceModel[] {
    return Array.isArray(data) ? data.map((item) => SpaceModel.fromJson(item)) : [];
  }
}
