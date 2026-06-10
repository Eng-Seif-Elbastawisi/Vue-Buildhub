import BaseApiService from "@/base/Data/ApiService/baseApiService";
import type { ApiEndpoints } from "@/base/Data/ApiService/baseApiService";
import { PrivacyEndpoints } from "./privacy.api.endpoints";

export default class PrivacyApiService extends BaseApiService {
  private static instance: PrivacyApiService;

  private readonly privacyEndpoints = new PrivacyEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): PrivacyApiService {
    if (!PrivacyApiService.instance) {
      PrivacyApiService.instance = new PrivacyApiService();
    }
    return PrivacyApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.privacyEndpoints.index,
      show: this.privacyEndpoints.show,
      create: this.privacyEndpoints.store,
      update: this.privacyEndpoints.update,
      delete: this.privacyEndpoints.delete,
    };
  }

  // executeCountryAction(params: Params): Promise<ApiResponse> {
  //   return this.customPost(this.endpoints.create || "", params);
  // }
}
