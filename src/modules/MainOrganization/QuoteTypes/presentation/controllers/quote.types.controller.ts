import type Params from '@/base/Core/Params/params';

import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';

import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';

import router from '@/router';

import { useFormsStore } from '@/stores/formsStore';
import { useUserStore } from '@/stores/user';

import type QuoteTypeModel from '../../core/models/quote.types.model';

import type ShowQuoteTypeParams from '../../core/params/show.quote.types.params';

import QuoteTypeRepository from '../../data/repositories/quote.types.repository';

import type AddQuoteTypeParams from '../../core/params/add.quote.types.params';

export default class QuoteTypeController extends BaseController<QuoteTypeModel, QuoteTypeModel[]> {
  private static instance: QuoteTypeController;

  private get userStore() {
    return useUserStore();
  }

  protected get repository() {
    return QuoteTypeRepository.getInstance();
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

  static getInstance(): QuoteTypeController {
    if (!QuoteTypeController.instance) {
      QuoteTypeController.instance = new QuoteTypeController();
    }

    return QuoteTypeController.instance;
  }

  /**
   * Get redirect path after create/update
   */
  private getQuoteTypesPath(parentId?: number): string {
    const prefix = this.userStore.user?.type === 1 ? '/mainportal' : '/organization';

    if (parentId !== undefined) {
      return `${prefix}/quote-types/${parentId}/sub-quote-types`;
    }

    return `${prefix}/quote-types`;
  }

  async create(params: AddQuoteTypeParams, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, {
      ...options,
      useJson: true,
    });

    if (result instanceof DataSuccess) {
      const parentId = (
        params as Params & {
          parentId?: number;
        }
      ).parentId;

      router.push(this.getQuoteTypesPath(parentId));

      if (formKey) {
        useFormsStore().clearFormData(formKey);
      }
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, {
      ...options,
      useJson: true,
    });

    if (result instanceof DataSuccess) {
      const parentId = (
        params as Params & {
          parentId?: number;
        }
      ).parentId;

      router.push(this.getQuoteTypesPath(parentId));

      if (formKey) {
        useFormsStore().clearFormData(formKey);
      }
    }

    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<QuoteTypeModel[]>> {
    return await super.fetchList(params, {
      ...options,
      useJson: true,
    });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowQuoteTypeParams).allLocales ? '*' : 'en',
      },
    });
  }

  async changeOrder(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<QuoteTypeModel> | undefined> {
    params?.validate();

    if (!params?.validate().isValid) {
      params?.validateOrThrow();
      return;
    }

    try {
      const result = await this.repository.changeOrder(params, {
        ...options,
        useJson: true,
      });

      if (result instanceof DataSuccess) {
        this.handleItemResponse(result, 'Updated successfully');
      } else if (result instanceof DataFailed) {
        this.handleErrorResponse(result);
      }

      return result;
    } catch (error: any) {
      const failed = new DataFailed<QuoteTypeModel>({
        error,
      });

      this.handleErrorResponse(failed);

      return failed;
    }
  }
}
