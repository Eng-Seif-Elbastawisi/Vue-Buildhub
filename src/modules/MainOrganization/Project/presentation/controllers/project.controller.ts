import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type ProjectModel from '../../core/models/project.model';
import type ProjectShowModel from '../../core/models/project.show.model';
import ProjectRepository from '../../data/repositories/project.repository';
import { useUserStore } from '@/stores/user';
import type ShowProjectParams from '../../core/params/show.project.params';

export default class ProjectController extends BaseController<ProjectShowModel, ProjectModel[]> {
  private static instance: ProjectController;

  private get userStore() {
    return useUserStore();
  }
  protected get repository() {
    return ProjectRepository.getInstance();
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
  static getInstance(): ProjectController {
    if (!ProjectController.instance) ProjectController.instance = new ProjectController();
    return ProjectController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
      router.push(
        this.userStore.user?.type === 1 ? '/mainportal/project' : '/organization/project',
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
        this.userStore.user?.type === 1 ? '/mainportal/project' : '/organization/project',
      );

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<ProjectModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowProjectParams).allLocales ? '*' : 'en',
      },
    });
  }
}
