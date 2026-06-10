import BaseApiService from "@/base/Data/ApiService/baseApiService";
import type { ApiEndpoints } from "@/base/Data/ApiService/baseApiService";
import { TermsConditionsEndpoints } from "./terms-conditions.api.endpoints";

export default class TermsConditionsApiService extends BaseApiService {
  private static instance: TermsConditionsApiService;

  private readonly termsConditionsEndpoints = new TermsConditionsEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): TermsConditionsApiService {
    if (!TermsConditionsApiService.instance) {
      TermsConditionsApiService.instance = new TermsConditionsApiService();
    }
    return TermsConditionsApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.termsConditionsEndpoints.index,
      show: this.termsConditionsEndpoints.show,
      create: this.termsConditionsEndpoints.store,
      update: this.termsConditionsEndpoints.update,
      delete: this.termsConditionsEndpoints.delete,
    };
  }

  // executeCountryAction(params: Params): Promise<ApiResponse> {
  //   return this.customPost(this.endpoints.create || "", params);
  // }
}
