import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { TermApiEndpoints } from './term.api.endpoints';

export default class TermApiService extends BaseApiService {
  private static instance: TermApiService;
  private readonly termEndpoints = new TermApiEndpoints();

  static getInstance(): TermApiService {
    if (!TermApiService.instance) TermApiService.instance = new TermApiService();
    return TermApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.termEndpoints.index,
      show: this.termEndpoints.show,
      create: this.termEndpoints.store,
      update: this.termEndpoints.update,
      delete: this.termEndpoints.delete,
    };
  }
}
