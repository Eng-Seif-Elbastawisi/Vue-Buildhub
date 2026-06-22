import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type CountryModel from '../../core/models/country.model';
import CountryRepository from '../../data/repositories/country.repository';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { type DataState, DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';

/**
 * Country Controller for managing countries
 *
 * This controller provides methods for CRUD operations on countries.
 */
export default class CountryController extends BaseController<CountryModel, CountryModel[]> {
  private static instance: CountryController;

  protected get repository() {
    return CountryRepository.getInstance();
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
  static getInstance(): CountryController {
    if (!CountryController.instance) {
      CountryController.instance = new CountryController();
    }
    return CountryController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, options);
    if (result instanceof DataSuccess) {
      router.push({ name: 'Countries' });
      if (formKey) {
        FormStore.clearFormData(formKey);
      }
    }
    return result;
  }

  async fetchList(params?: Params, options?: ApiCallOptions): Promise<DataState<CountryModel[]>> {
    return super.fetchList(params, { ...options, useStaticData: true });
  }

  // async update(params: Params, options?: ApiCallOptions, formKey?: string) {
  //   const FormStore = useFormsStore();

  //   const result = await super.update(params, options);
  //   if (result instanceof DataSuccess) {
  //     router.push({ name: 'Countries' });
  //     if (formKey) {
  //       FormStore.clearFormData(formKey);
  //     }
  //   }
  //   return result;
  // }
}
