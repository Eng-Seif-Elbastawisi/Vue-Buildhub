import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import LocationApiService from '../api/location.api-service';
import LocationModel from '../../core/models/location.model';
import LocationShowModel from '../../core/models/location.show.model';

export default class LocationRepository extends BaseRepository<LocationShowModel, LocationModel[]> {
  private static instance: LocationRepository;

  protected get apiService() {
    return LocationApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): LocationShowModel {
    return LocationShowModel.example;
  }

  protected get mockList(): LocationModel[] {
    return [{ ...LocationModel.example }, { ...LocationModel.example }];
  }

  static getInstance(): LocationRepository {
    if (!LocationRepository.instance) {
      LocationRepository.instance = new LocationRepository();
    }
    return LocationRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): LocationShowModel {
    return LocationShowModel.fromJson(data);
  }

  protected parseList(data: unknown): LocationModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => LocationModel.fromJson(item));
  }
}
