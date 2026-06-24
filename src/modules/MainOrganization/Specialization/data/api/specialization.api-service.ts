import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { SpecializationApiEndpoints } from './specialization.api.endpoints';

export default class SpecializationApiService extends BaseApiService {
  private static instance: SpecializationApiService;
  private readonly specializationEndpoints = new SpecializationApiEndpoints();

  static getInstance(): SpecializationApiService {
    if (!SpecializationApiService.instance)
      SpecializationApiService.instance = new SpecializationApiService();
    return SpecializationApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.specializationEndpoints.index,
      show: this.specializationEndpoints.show,
      create: this.specializationEndpoints.store,
      update: this.specializationEndpoints.update,
      delete: this.specializationEndpoints.delete,
    };
  }
}
