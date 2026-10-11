import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type WarehouseModel from '../../core/models/warehouse.model';
import type WarehouseShowModel from '../../core/models/warehouse.show.model';
import WarehouseRepository from '../../data/repositories/warehouse.repository';
import { useUserStore } from '@/stores/user';
import type ShowWarehouseParams from '../../core/params/show.warehouse.params';

export default class WarehouseController extends BaseController<
  WarehouseShowModel,
  WarehouseModel[]
> {
  private static instance: WarehouseController;

  private get userStore() {
    return useUserStore();
  }
  protected get repository() {
    return WarehouseRepository.getInstance();
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
  static getInstance(): WarehouseController {
    if (!WarehouseController.instance) WarehouseController.instance = new WarehouseController();
    return WarehouseController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      router.push(
        this.userStore.user?.type === 1 ? '/mainportal/warehouse' : '/organization/warehouse',
      );

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      router.push(
        this.userStore.user?.type === 1 ? '/mainportal/warehouse' : '/organization/warehouse',
      );

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<WarehouseModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowWarehouseParams).allLocales ? '*' : 'en',
      },
    });
  }
}
