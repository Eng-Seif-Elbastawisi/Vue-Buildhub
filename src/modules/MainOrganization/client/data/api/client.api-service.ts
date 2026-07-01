import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ClientApiEndpoints } from './client.api.endpoints';

export default class ClientApiService extends BaseApiService {
  private static instance: ClientApiService;

  private readonly clientEndpoints = new ClientApiEndpoints();

  static getInstance(): ClientApiService {
    if (!ClientApiService.instance) {
      ClientApiService.instance = new ClientApiService();
    }
    return ClientApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.clientEndpoints.index,
      show: this.clientEndpoints.show,
      create: this.clientEndpoints.store,
      update: this.clientEndpoints.update,
      delete: this.clientEndpoints.delete,
    };
  }
}
