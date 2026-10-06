import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ContractorApiEndpoints } from './contractor.api.endpoints';

export default class ContractorApiService extends BaseApiService {
  private static instance: ContractorApiService;
  private readonly contractorEndpoints = new ContractorApiEndpoints();

  static getInstance(): ContractorApiService {
    if (!ContractorApiService.instance) {
      ContractorApiService.instance = new ContractorApiService();
    }
    return ContractorApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.contractorEndpoints.index,
      show: this.contractorEndpoints.show,
      create: this.contractorEndpoints.store,
      update: this.contractorEndpoints.update,
      delete: this.contractorEndpoints.delete,
    };
  }
}
