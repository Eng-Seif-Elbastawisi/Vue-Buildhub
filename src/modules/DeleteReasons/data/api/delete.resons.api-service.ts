import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { DeleteReasonsEndpoints } from './delete.reasons.api.endpoints';

export default class DeleteResasonsApiService extends BaseApiService {
  private static instance: DeleteResasonsApiService;

  private readonly deleteReasonsEndpoints = new DeleteReasonsEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): DeleteResasonsApiService {
    if (!DeleteResasonsApiService.instance) {
      DeleteResasonsApiService.instance = new DeleteResasonsApiService();
    }
    return DeleteResasonsApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.deleteReasonsEndpoints.index,
      show: this.deleteReasonsEndpoints.show,
      create: this.deleteReasonsEndpoints.create,
      update: this.deleteReasonsEndpoints.edit,
      delete: this.deleteReasonsEndpoints.delete,
    };
  }
}
