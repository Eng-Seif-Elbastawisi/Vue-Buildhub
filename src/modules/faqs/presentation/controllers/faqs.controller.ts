import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type FaqsModel from '../../core/models/faqs.model';
import FaqsRepository from '../../data/repositories/faqs.repository';
import type FaqsDetailsParams from '../../core/params/faqs.details.params';

/**
 * Country Controller for managing countries
 *
 * This controller provides methods for CRUD operations on countries.
 */
export default class FaqsController extends BaseController<FaqsModel, FaqsModel[]> {
  private static instance: FaqsController;

  protected get repository() {
    return FaqsRepository.getInstance();
  }

  /**
   * Controller configuration
   * Defines behavior for loading, success, and error dialogs
   */
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

  /**
   * Get singleton instance
   * @returns CountryController instance
   */
  static getInstance(): FaqsController {
    if (!FaqsController.instance) {
      FaqsController.instance = new FaqsController();
    }
    return FaqsController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      router.push({ name: 'Faqs' });
      if (formKey) {
        FormStore.clearFormData(formKey);
      }
    }
    return result;
  }

  async fetchList(_params?: Params, options?: ApiCallOptions) {
    return super.fetchList(_params, {
      ...options,
      useJson: true,
    });
  }
  async fetchOne(params: FaqsDetailsParams, options?: ApiCallOptions) {
    return super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': params?.isLocale ? '*' : 'en',
      },
    });
  }
}
