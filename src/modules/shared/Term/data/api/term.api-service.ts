import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { TermEndpoints } from './term.api.endpoints';

export default class TermApiService extends BaseApiService {
  private static instance: TermApiService;
  private readonly termEndpoints = new TermEndpoints();

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
