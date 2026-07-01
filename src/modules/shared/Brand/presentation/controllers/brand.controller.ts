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
import type BrandShowModel from '../../core/models/brand.show.model';
import type BrandModel from '../../core/models/brand.model';
import type ShowBrandParams from '../../core/params/show.brand.params';
import BrandRepository from '../../data/repositories/brand.repository';
const userStore = useUserStore();
export default class BrandController extends BaseController<BrandShowModel, BrandModel[]> {
  private static instance: BrandController;

  protected get repository() {
    return BrandRepository.getInstance();
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

  static getInstance(): BrandController {
    if (!BrandController.instance) {
      BrandController.instance = new BrandController();
    }
    return BrandController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();
    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      router.push(userStore.user?.type === 1 ? '/mainportal/brand' : '/organization/brand');
      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      router.push(userStore.user?.type === 1 ? '/mainportal/brand' : '/organization/brand');
      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<BrandModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowBrandParams).allLocales ? '*' : 'en',
      },
    });
  }
}
