import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { type DataState, DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import router from '@/router';
import SupportContactsRepository from '../../data/repositories/support.repository';
import type SupportContactsModel from '../../core/models/support.contatcts.model';

/**
 * Country Controller for managing countries
 *
 * This controller provides methods for CRUD operations on countries.
 */
export default class SupportContactsController extends BaseController<
  SupportContactsModel,
  SupportContactsModel[]
> {
  private static instance: SupportContactsController;

  protected get repository() {
    return SupportContactsRepository.getInstance();
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
  static getInstance(): SupportContactsController {
    if (!SupportContactsController.instance) {
      SupportContactsController.instance = new SupportContactsController();
    }
    return SupportContactsController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, _formKey?: string) {
    // const FormStore = useFormsStore();

    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      router.push({ name: 'Support' });
    }
    return result;
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    const result = await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: { 'Accept-Language': (params as any).isLocale ? '*' : 'en' },
    });
    return result;
  }
  async fetchList(
    params?: Params,
    options?: ApiCallOptions,
    isLocale?: boolean,
  ): Promise<DataState<SupportContactsModel[]>> {
    const result = await super.fetchList(params, {
      ...options,
      headers: {
        'Accept-Language': isLocale ? '*' : 'en',
      },
    });
    return result;
  }
  // async fetchList(
  //   params: IndexSupportContactsParams,
  //   options?: ApiCallOptions,
  // ): Promise<DataState<SupportContactsModel[]> | undefined> {
  //   return await super.fetchList(params, {
  //     ...options,
  //     useJson: true,
  //     headers: { 'Accept-Language': params.allLocale ? '*' : 'en' },
  //   });
  // }
}
