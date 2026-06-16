import BaseApiService from "@/base/Data/ApiService/baseApiService";
import type { ApiEndpoints } from "@/base/Data/ApiService/baseApiService";
import { ClientApiEndpoints } from "./client.api.endpoints";

export default class ClientApiService extends BaseApiService {
  private static instance: ClientApiService;

  private readonly ClientEndpoints = new ClientApiEndpoints();

  static getInstance(): ClientApiService {
    if (!ClientApiService.instance) {
      ClientApiService.instance = new ClientApiService();
    }
    return ClientApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.ClientEndpoints.index,
      show: this.ClientEndpoints.show,
      create: this.ClientEndpoints.store,
      update: this.ClientEndpoints.update,
      delete: this.ClientEndpoints.delete,
    };
  }
}
