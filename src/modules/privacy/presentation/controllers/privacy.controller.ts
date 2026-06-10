import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { type DataState, DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import router from '@/router';
import type PrivacyModel from '../../core/models/privacy.model';
import PrivacyRepository from '../../data/repositories/privacy.repository';

/**
 * Country Controller for managing countries
 *
 * This controller provides methods for CRUD operations on countries.
 */
export default class PrivacyController extends BaseController<PrivacyModel, PrivacyModel[]> {
  private static instance: PrivacyController;

  protected get repository() {
    return PrivacyRepository.getInstance();
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
  static getInstance(): PrivacyController {
    if (!PrivacyController.instance) {
      PrivacyController.instance = new PrivacyController();
    }
    return PrivacyController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, _formKey?: string) {
    // const FormStore = useFormsStore();

    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      router.push({ name: 'Privacy' });
      // if (formKey) {
      // FormStore.clearFormData(formKey);
      // }
    }
    return result;
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    const result = await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: { 'Accept-Language': (params as any).allLocales ? '*' : 'en' },
    });
    return result;
  }

  async fetchList(params?: Params, options?: ApiCallOptions): Promise<DataState<PrivacyModel[]>> {
    const result = await super.fetchList(params, {
      ...options,
      headers: {
        'Accept-Language': '*',
      },
    });
    return result;
  }
}
