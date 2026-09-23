import type Params from '@/base/Core/Params/params';
import {
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import { notifyDataMutationSucceeded } from '@/base/Presentation/Controller/dataMutationEvent';
import { translate } from '@/locales/i18n';
import { useFormsStore } from '@/stores/formsStore';

import type AddExecutionQuoteParams from '../../core/params/add.execution.quote.params';
import type StoreExecutionQuoteDetailsParams from '../../core/params/store.execution.quote.details.params';
import type ExecutionQuoteShowModel from '../../core/models/execution.quote.show.model';
import ExecutionQuoteRepository from '../../data/repositories/execution.quote.repository';

export default class ExecutionQuoteController extends BaseController<
  ExecutionQuoteShowModel,
  ExecutionQuoteShowModel[]
> {
  private static instance: ExecutionQuoteController;

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
   * Step 1: save only the base/header data through store_quote.
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

  private completeDetailsStore(formKey?: string) {
    this.showSuccessToast(translate('execution_quote.details_saved'));
    notifyDataMutationSucceeded();

    if (formKey) useFormsStore().clearFormData(formKey);
  }

  async storeDetails(requests: StoreExecutionQuoteDetailsParams[], formKey?: string) {
    let lastSuccess: DataSuccess<void> | undefined;

    for (const request of requests) {
      const response = await this.repository.storeDetails(request);

      if (!(response instanceof DataSuccess)) {
        this.handleErrorResponse(response);
        return response;
      }

      lastSuccess = response;
    }

    if (!lastSuccess) return undefined;

    this.completeDetailsStore(formKey);

    return lastSuccess;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<ExecutionQuoteShowModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
}
