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
import type SupplyShowModel from '../../core/models/supply.show.model';
import type SupplyModel from '../../core/models/supply.model';
import type ShowSupplyParams from '../../core/params/show.supply.params';
import SupplyRepository from '../../data/repositories/supply.repository';
import { useUserStore } from '@/stores/user';

export default class SupplyController extends BaseController<SupplyShowModel, SupplyModel[]> {
  private static instance: SupplyController;

  protected get repository() {
    return SupplyRepository.getInstance();
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

  static getInstance(): SupplyController {
    if (!SupplyController.instance) {
      SupplyController.instance = new SupplyController();
    }
    return SupplyController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      // router.push({ name: 'Supply' });
      router.push(this.userStore.user?.type === 1 ? '/mainportal/supply' : '/organization/supply');

      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      // router.push({ name: 'Supply' });
      router.push(this.userStore.user?.type === 1 ? '/mainportal/supply' : '/organization/supply');

      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<SupplyModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowSupplyParams).allLocales ? '*' : 'en',
      },
    });
  }
}
