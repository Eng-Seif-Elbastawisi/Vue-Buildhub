import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type ItemTypesModel from '../../core/models/item.types.model';
import type ItemTypesShowModel from '../../core/models/item.types.show.model';
import ItemTypesRepository from '../../data/repositories/item.types.repository';
import { useUserStore } from '@/stores/user';
import type ShowItemTypesParams from '../../core/params/show.item.types.params';

export default class ItemTypesController extends BaseController<
  ItemTypesShowModel,
  ItemTypesModel[]
> {
  private static instance: ItemTypesController;

  private get userStore() {
    return useUserStore();
  }
  protected get repository() {
    return ItemTypesRepository.getInstance();
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
  static getInstance(): ItemTypesController {
    if (!ItemTypesController.instance) ItemTypesController.instance = new ItemTypesController();
    return ItemTypesController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
      router.push(
        this.userStore.user?.type === 1 ? '/mainportal/item_types' : '/organization/item_types',
      );

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
      router.push(
        this.userStore.user?.type === 1 ? '/mainportal/item_types' : '/organization/item_types',
      );

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<ItemTypesModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowItemTypesParams).allLocales ? '*' : 'en',
      },
    });
  }
}
