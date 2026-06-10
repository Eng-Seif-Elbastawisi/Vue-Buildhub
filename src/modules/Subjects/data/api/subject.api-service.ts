import BaseApiService from "@/base/Data/ApiService/baseApiService";
import type { ApiEndpoints } from "@/base/Data/ApiService/baseApiService";
import { SubjectEndpoints } from "./subject.api.endpoints";

export default class SubjectApiService extends BaseApiService {
  private static instance: SubjectApiService;

  private readonly subjectEndpoints = new SubjectEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): SubjectApiService {
    if (!SubjectApiService.instance) {
      SubjectApiService.instance = new SubjectApiService();
    }
    return SubjectApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.subjectEndpoints.index,
      show: this.subjectEndpoints.show,
      create: this.subjectEndpoints.store,
      update: this.subjectEndpoints.update,
      delete: this.subjectEndpoints.delete,
    };
  }

  // executeCountryAction(params: Params): Promise<ApiResponse> {
  //   return this.customPost(this.endpoints.create || "", params);
  // }
}
