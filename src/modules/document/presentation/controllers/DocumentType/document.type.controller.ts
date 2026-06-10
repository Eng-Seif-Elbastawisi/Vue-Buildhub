import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';

import DocumentTypeRepository from '@/modules/document/data/repositories/DocumentType/document.type.repository';
import type DocumentTypeModel from '@/modules/document/core/models/documentType/document.type.model';

export default class DocumentTypeController extends BaseController<DocumentTypeModel, DocumentTypeModel[]> {
  private static instance: DocumentTypeController;

  protected get repository() {
    return DocumentTypeRepository.getInstance();
  }

  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: false,
      showSuccessDialog: false,
      showErrorDialog: false,
      showErrorTosat: true,
      showSuccessTosat: true,
      autoRetry: false,
      maxAutoRetries: 1,
    };
  }

  private constructor() {
    super();
  }

  static getInstance(): DocumentTypeController {
    if (!DocumentTypeController.instance) {
      DocumentTypeController.instance = new DocumentTypeController();
    }
    return DocumentTypeController.instance;
  }

  async create(params: Params, options?: ApiCallOptions) {
    return super.create(params, { ...options, useJson: true });
  }

  async update(params: Params, options?: ApiCallOptions) {
    return super.update(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as any)?.isLocale ? 'en' : '*',
      },
    });
  }
}
