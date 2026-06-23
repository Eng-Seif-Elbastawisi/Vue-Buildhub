import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type ProjectTypeModel from '../../core/models/project-type.model';
import type ProjectTypeShowModel from '../../core/models/project-type.show.model';
import ProjectTypeRepository from '../../data/repositories/project-type.repository';
import { useUserStore } from '@/stores/user';


export default class ProjectTypeController extends BaseController<
  ProjectTypeShowModel,
  ProjectTypeModel[]
> {
  private static instance: ProjectTypeController;
  
  private get userStore() {
    return useUserStore();
  }
  protected get repository() {
    return ProjectTypeRepository.getInstance();
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
  static getInstance(): ProjectTypeController {
    if (!ProjectTypeController.instance)
      ProjectTypeController.instance = new ProjectTypeController();
    return ProjectTypeController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
      router.push(this.userStore.user?.type === 1 ? '/mainportal/projectType' : '/organization/projectType');

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
            router.push(this.userStore.user?.type === 1 ? '/mainportal/projectType' : '/organization/projectType');

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<ProjectTypeModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
}
