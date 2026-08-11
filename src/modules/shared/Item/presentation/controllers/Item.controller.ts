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
import type ItemShowModel from '../../core/models/Item.show.model';
import type ItemModel from '../../core/models/Item.model';
import type ShowItemParams from '../../core/params/show.Item.params';
import ItemRepository from '../../data/repositories/Item.repository';
import { useUserStore } from '@/stores/user';

export default class ItemController extends BaseController<ItemShowModel, ItemModel[]> {
  private static instance: ItemController;
  
protected get userStore() {
    return useUserStore();
  }
  protected get repository() {
    return ItemRepository.getInstance();
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

  static getInstance(): ItemController {
    if (!ItemController.instance) {
      ItemController.instance = new ItemController();
    }
    return ItemController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
  const FormStore = useFormsStore();
  const result = await super.create(params, { ...options, useJson: true });
  if (result instanceof DataSuccess) {
    const serviceType = router.currentRoute.value.query.service_type;
    await router.push({
      path: this.userStore.user?.type === 1 ? '/admin/item': '/organization/item',
      query: serviceType ? { service_type: serviceType, } : undefined,
    });
    if (formKey) { FormStore.clearFormData(formKey); }
  }
  return result;
}

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();
    const result = await super.update(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      const serviceType = router.currentRoute.value.query.service_type;
      router.push({
        path: this.userStore.user?.type === 1 ? '/admin/item': '/organization/item',
        query: serviceType ? { service_type: serviceType, } : undefined,
      });
      if (formKey) FormStore.clearFormData(formKey);
    }
    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<ItemModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowItemParams).allLocales ? '*' : 'en',
      },
    });
  }
}
