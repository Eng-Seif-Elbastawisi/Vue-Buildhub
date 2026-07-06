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
import type ProjectItemShowModel from '../../core/models/project.Item.show.model';
import type ProjectItemModel from '../../core/models/project.Item.model';
import type ShowProjectItemParams from '../../core/params/show.project.Item.params';
import ProjectItemRepository from '../../data/repositories/project.Item.repository';
import { useUserStore } from '@/stores/user';

export default class ProjectItemController extends BaseController<
  ProjectItemShowModel,
  ProjectItemModel[]
> {
  private static instance: ProjectItemController;

  protected get userStore() {
    return useUserStore();
  }

  protected get repository() {
    return ProjectItemRepository.getInstance();
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

  static getInstance(): ProjectItemController {
    if (!ProjectItemController.instance) {
      ProjectItemController.instance = new ProjectItemController();
    }
    return ProjectItemController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, { ...options, useJson: true });

    // if (result instanceof DataSuccess) {
    //   router.push(
    //     this.userStore.user?.type === 1 ? '/admin/project-item' : '/organization/project-item',
    //   );
    //   if (formKey) FormStore.clearFormData(formKey);
    // }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      router.push(
        this.userStore.user?.type === 1 ? '/admin/project-item' : '/organization/project-item',
      );
      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<ProjectItemModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowProjectItemParams).allLocales ? '*' : 'en',
      },
    });
  }
}
