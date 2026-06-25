import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type SpecializationModel from '../../core/models/project.model';
import type SpecializationShowModel from '../../core/models/project.show.model';
import SpecializationRepository from '../../data/repositories/project.repository';
import { useUserStore } from '@/stores/user';
import type ShowSpecializationParams from '../../core/params/show.project.params';

export default class SpecializationController extends BaseController<
  SpecializationShowModel,
  SpecializationModel[]
> {
  private static instance: SpecializationController;

  private get userStore() {
    return useUserStore();
  }
  protected get repository() {
    return SpecializationRepository.getInstance();
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
  static getInstance(): SpecializationController {
    if (!SpecializationController.instance)
      SpecializationController.instance = new SpecializationController();
    return SpecializationController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
      router.push(
        this.userStore.user?.type === 1
          ? '/mainportal/specialization'
          : '/organization/specialization',
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
        this.userStore.user?.type === 1
          ? '/mainportal/specialization'
          : '/organization/specialization',
      );

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<SpecializationModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowSpecializationParams).allLocales ? '*' : 'en',
      },
    });
  }
}
