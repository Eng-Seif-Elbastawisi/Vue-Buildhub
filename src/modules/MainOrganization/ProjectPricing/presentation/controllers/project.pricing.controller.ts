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
import type ProjectPricingShowModel from '../../core/models/project.pricing.show.model';
import type ProjectPricingModel from '../../core/models/project.pricing.model';
import type ShowProjectPricingParams from '../../core/params/show.project.pricing.params';
import ProjectPricingRepository from '../../data/repositories/project.pricing.repository';
import { useUserStore } from '@/stores/user';

export default class ProjectPricingController extends BaseController<
  ProjectPricingShowModel,
  ProjectPricingModel[]
> {
  private static instance: ProjectPricingController;

  protected get userStore() {
    return useUserStore();
  }

  protected get repository() {
    return ProjectPricingRepository.getInstance();
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

  static getInstance(): ProjectPricingController {
    if (!ProjectPricingController.instance) {
      ProjectPricingController.instance = new ProjectPricingController();
    }
    return ProjectPricingController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess && formKey) {
      useFormsStore().clearFormData(formKey);
    }

    // if (result instanceof DataSuccess) {
    //   router.push(
    //     this.userStore.user?.type === 1
    //       ? '/admin/project-pricing'
    //       : '/organization/project-pricing',
    //   );
    // }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      router.push(
        this.userStore.user?.type === 1
          ? '/admin/project-pricing'
          : '/organization/project-pricing',
      );
      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<ProjectPricingModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowProjectPricingParams).allLocales ? '*' : 'en',
      },
    });
  }
}
