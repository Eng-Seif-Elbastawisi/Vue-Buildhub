import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import { useUserStore } from '@/stores/user';
import type AddExecutionQuoteParams from '../../core/params/add.execution.quote.params';
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

  async create(params: AddExecutionQuoteParams, options?: ApiCallOptions, formKey?: string) {
    const createResponse = await super.create(params, { ...options, useJson: true });

    if (createResponse instanceof DataSuccess) {
      await router.push(
        this.userStore.user?.type === 1
          ? '/mainportal/execution-quotes'
          : '/organization/execution-quotes',
      );

      if (formKey) {
        useFormsStore().clearFormData(formKey);
      }
    }

    return createResponse;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<ExecutionQuoteModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
}
