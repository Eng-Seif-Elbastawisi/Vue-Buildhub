import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import { notifyDataMutationSucceeded } from '@/base/Presentation/Controller/dataMutationEvent';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import { useUserStore } from '@/stores/user';

import type AddExecutionQuoteParams from '../../core/params/add.execution.quote.params';
import type StoreExecutionQuoteDetailsParams from '../../core/params/store.execution.quote.details.params';
import type ExecutionQuoteModel from '../../core/models/execution.quote.model';
import ExecutionQuoteRepository from '../../data/repositories/execution.quote.repository';

export default class ExecutionQuoteController extends BaseController<
  ExecutionQuoteModel,
  ExecutionQuoteModel[]
> {
  private static instance: ExecutionQuoteController;

  private get userStore() {
    return useUserStore();
  }

  protected get repository() {
    return ExecutionQuoteRepository.getInstance();
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

  static getInstance(): ExecutionQuoteController {
    if (!ExecutionQuoteController.instance) {
      ExecutionQuoteController.instance = new ExecutionQuoteController();
    }

    return ExecutionQuoteController.instance;
  }

  /**
   * Step 1: save only the base/header data through store_execution_quote.
   * Important: there is intentionally NO redirect here because the user must
   * continue building the quote after the backend returns the new quote id.
   */
  async createBase(params: AddExecutionQuoteParams, options?: ApiCallOptions) {
    return await super.create(params, { ...options, useJson: true });
  }

  /**
   * Compatibility alias for any existing call sites. It behaves like the new
   * first-step save and no longer redirects.
   */
  async create(params: AddExecutionQuoteParams, options?: ApiCallOptions) {
    return await this.createBase(params, options);
  }

  /**
   * Step 2: save quote type + stages + items using the same customPost style
   * used by Products custom actions.
   */
  async storeDetails(
    params: StoreExecutionQuoteDetailsParams,
    _options?: ApiCallOptions,
    formKey?: string,
  ) {
    const result = await this.repository.storeDetails(params);

    if (result.data?.status === true) {
      this.showSuccessToast('Created successfully');
      notifyDataMutationSucceeded();

      await router.push(
        this.userStore.user?.type === 1
          ? '/mainportal/execution-quotes'
          : '/organization/execution-quotes',
      );

      if (formKey) {
        useFormsStore().clearFormData(formKey);
      }
    } else {
      this.handleErrorResponse(result);
    }

    return result;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<ExecutionQuoteModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
}
