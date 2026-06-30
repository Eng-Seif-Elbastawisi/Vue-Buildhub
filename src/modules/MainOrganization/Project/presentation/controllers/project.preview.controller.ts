import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type ProjectPreviewModel from '../../core/models/project.preview.model';
import type ProjectPreviewShowModel from '../../core/models/project.preview.show.model';
import ProjectPreviewRepository from '../../data/repositories/project.preview.repository';
import { useUserStore } from '@/stores/user';
import type ShowProjectPreviewParams from '../../core/params/show.project.preview.params';

export default class ProjectPreviewController extends BaseController<
  ProjectPreviewShowModel,
  ProjectPreviewModel[]
> {
  private static instance: ProjectPreviewController;

  private get userStore() {
    return useUserStore();
  }

  protected get repository() {
    return ProjectPreviewRepository.getInstance();
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

  static getInstance(): ProjectPreviewController {
    if (!ProjectPreviewController.instance) {
      ProjectPreviewController.instance = new ProjectPreviewController();
    }

    return ProjectPreviewController.instance;
  }

  private getPrefix(): string {
    return this.userStore.user?.type === 1 ? '/mainportal' : '/organization';
  }

  private getProjectId(params: Params, data: any): number | undefined {
    return data?.project_id ?? (params as any)?.project_id;
  }

  private getProjectPreviewId(data: any): number | undefined {
    return data?.id ?? data?.project_preview_id;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      const data = result.data as any;

      const projectId = this.getProjectId(params, data);
      const projectPreviewId = this.getProjectPreviewId(data);

      if (formKey) {
        useFormsStore().clearFormData(formKey);
      }

      if (projectId && projectPreviewId) {
        router.push({
          path: `${this.getPrefix()}/project_floor/add`,
          query: {
            project_id: projectId,
            project_preview_id: projectPreviewId,
          },
        });

        return result;
      }

      router.push(
        this.userStore.user?.type === 1 ? '/mainportal/project' : '/organization/project',
      );
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      router.push(
        this.userStore.user?.type === 1
          ? '/mainportal/project-preview'
          : '/organization/project-preview',
      );

      if (formKey) {
        useFormsStore().clearFormData(formKey);
      }
    }

    return result;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<ProjectPreviewModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowProjectPreviewParams).allLocales ? '*' : 'en',
      },
    });
  }
}
