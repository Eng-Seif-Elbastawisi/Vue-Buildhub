import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';

import {
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import { useUserStore } from '@/stores/user';

import type LaborModel from '../../core/models/labor.model';
import type LaborShowModel from '../../core/models/labor.show.model';
import type ShowLaborParams from '../../core/params/show.labor.params';

import LaborRepository from '../../data/repositories/labor.repository';

export default class LaborController extends BaseController<LaborShowModel, LaborModel[]> {
  private static instance: LaborController;

  protected get repository() {
    return LaborRepository.getInstance();
  }

  get userStore() {
    return useUserStore();
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

  static getInstance(): LaborController {
    if (!LaborController.instance) {
      LaborController.instance = new LaborController();
    }

    return LaborController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, {
      ...options,
      useJson: true,
    });

    if (result instanceof DataSuccess) {
      router.push(this.userStore.user?.type === 1 ? '/admin/labor' : '/organization/labor');

      if (formKey) {
        FormStore.clearFormData(formKey);
      }
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.update(params, {
      ...options,
      useJson: true,
    });

    if (result instanceof DataSuccess) {
      router.push(this.userStore.user?.type === 1 ? '/admin/labor' : '/organization/labor');

      if (formKey) {
        FormStore.clearFormData(formKey);
      }
    }

    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<LaborModel[]>> {
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
        'Accept-Language': (params as ShowLaborParams).allLocales ? '*' : 'en',
      },
    });
  }
}
