import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type SpaceModel from '../../core/models/space.model';
import type SpaceShowModel from '../../core/models/space.show.model';
import SpaceRepository from '../../data/repositories/space.repository';
import { useUserStore } from '@/stores/user';
import type ShowSpaceParams from '../../core/params/show.space.params';

export default class SpaceController extends BaseController<SpaceShowModel, SpaceModel[]> {
  private static instance: SpaceController;

  private get userStore() {
    return useUserStore();
  }
  protected get repository() {
    return SpaceRepository.getInstance();
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
  static getInstance(): SpaceController {
    if (!SpaceController.instance) SpaceController.instance = new SpaceController();
    return SpaceController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
      router.push(this.userStore.user?.type === 1 ? '/admin/space' : '/organization/space');

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
      router.push(this.userStore.user?.type === 1 ? '/admin/space' : '/organization/space');

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<SpaceModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowSpaceParams).allLocales ? '*' : 'en',
      },
    });
  }
}
