import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { SpaceApiEndpoints } from './space.api.endpoints';

export default class SpaceApiService extends BaseApiService {
  private static instance: SpaceApiService;
  private readonly spaceEndpoints = new SpaceApiEndpoints();

  static getInstance(): SpaceApiService {
    if (!SpaceApiService.instance) SpaceApiService.instance = new SpaceApiService();
    return SpaceApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.spaceEndpoints.index,
      show: this.spaceEndpoints.show,
      create: this.spaceEndpoints.store,
      update: this.spaceEndpoints.update,
      delete: this.spaceEndpoints.delete,
    };
  }
}
