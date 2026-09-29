import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { AttachmentTypeApiEndpoints } from './attachment.type.api.endpoints';

export default class AttachmentTypeApiService extends BaseApiService {
  private static instance: AttachmentTypeApiService;
  private readonly attachmentTypeEndpoints = new AttachmentTypeApiEndpoints();

  static getInstance(): AttachmentTypeApiService {
    if (!AttachmentTypeApiService.instance) {
      AttachmentTypeApiService.instance = new AttachmentTypeApiService();
    }
    return AttachmentTypeApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.attachmentTypeEndpoints.index,
      show: this.attachmentTypeEndpoints.show,
      create: this.attachmentTypeEndpoints.store,
      update: this.attachmentTypeEndpoints.update,
      delete: this.attachmentTypeEndpoints.delete,
    };
  }
}
