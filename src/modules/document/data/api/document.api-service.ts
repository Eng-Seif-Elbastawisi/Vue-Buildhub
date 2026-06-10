import BaseApiService from "@/base/Data/ApiService/baseApiService";
import type { ApiEndpoints } from "@/base/Data/ApiService/baseApiService";
import { DocumentEndpoints } from "./document.api.endpoints";

export default class DocumentApiService extends BaseApiService {
  private static instance: DocumentApiService;

  private readonly documentEndpoints = new DocumentEndpoints();

  static getInstance(): DocumentApiService {
    if (!DocumentApiService.instance) {
      DocumentApiService.instance = new DocumentApiService();
    }
    return DocumentApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.documentEndpoints.index,
      show: this.documentEndpoints.show,
      create: this.documentEndpoints.store,
      update: this.documentEndpoints.update,
      delete: this.documentEndpoints.delete,
    };
  }
}
