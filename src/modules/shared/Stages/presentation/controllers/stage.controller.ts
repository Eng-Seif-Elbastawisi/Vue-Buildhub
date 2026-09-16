import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataFailed, DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';

import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';

import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import { useUserStore } from '@/stores/user';

import type StageModel from '../../core/models/stage.model';
import type ShowStageParams from '../../core/params/show.stage.params';
import StageRepository from '../../data/repositories/stage.repository';

export default class StageController extends BaseController<StageModel, StageModel[]> {
  private static instance: StageController;

  private get userStore() {
    return useUserStore();
  }

  protected get repository() {
    return StageRepository.getInstance();
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

  static getInstance(): StageController {
    if (!StageController.instance) {
      StageController.instance = new StageController();
    }

    return StageController.instance;
  }

  /**
   * Get redirect path after create/update
   */
  private getStagesPath(parentId?: number): string {
    const prefix = this.userStore.user?.type === 1 ? '/mainportal' : '/organization';

    if (parentId !== undefined) {
      return `${prefix}/stages/${parentId}/sub-stages`;
    }

    return `${prefix}/stages`;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, {
      ...options,
      useJson: true,
    });

    if (result instanceof DataSuccess) {
      const parentId = (params as Params & { parentId?: number }).parentId;

      router.push(this.getStagesPath(parentId));

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
      const parentId = (params as Params & { parentId?: number }).parentId;

      router.push(this.getStagesPath(parentId));

      if (formKey) {
        useFormsStore().clearFormData(formKey);
      }
    }

    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<StageModel[]>> {
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
        'Accept-Language': (params as ShowStageParams).allLocales ? '*' : 'en',
      },
    });
  }

  async changeOrder(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<StageModel> | undefined> {
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
      const failed = new DataFailed<StageModel>({ error });
      this.handleErrorResponse(failed);
      return failed;
    }
  }
}
