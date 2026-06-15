import BaseApiService from "@/base/Data/ApiService/baseApiService";
import type { ApiEndpoints } from "@/base/Data/ApiService/baseApiService";
import { SuppliersEndpoints } from "./Suppliers.api.endpoints";

export default class SuppliersApiService extends BaseApiService {
  private static instance: SuppliersApiService;

  private readonly SuppliersEndpoints = new SuppliersEndpoints();

  static getInstance(): SuppliersApiService {
    if (!SuppliersApiService.instance) {
      SuppliersApiService.instance = new SuppliersApiService();
    }
    return SuppliersApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.SuppliersEndpoints.index,
      show: this.SuppliersEndpoints.show,
      create: this.SuppliersEndpoints.store,
      update: this.SuppliersEndpoints.update,
      delete: this.SuppliersEndpoints.delete,
    };
  }
}
