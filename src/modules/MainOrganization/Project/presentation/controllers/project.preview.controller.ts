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

  private getPositiveInteger(value: unknown): number | undefined {
    const numberValue = Number(value);

    return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
  }

  private getProjectId(params: Params, data?: ProjectPreviewShowModel | null): number | undefined {
    return (
      this.getPositiveInteger(data?.project_id) ??
      this.getPositiveInteger(params.toMap().project_id)
    );
  }

  private getProjectPreviewId(data?: ProjectPreviewShowModel | null): number | undefined {
    return this.getPositiveInteger(data?.id) ?? this.getPositiveInteger(data?.project_preview_id);
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      const projectId = this.getProjectId(params, result.data);
      const projectPreviewId = this.getProjectPreviewId(result.data);

      if (formKey) {
        useFormsStore().clearFormData(formKey);
      }

      if (projectId && projectPreviewId) {
        await router.push({
          path: `${this.getPrefix()}/project_floor/add`,
          query: {
            project_id: projectId,
            project_preview_id: projectPreviewId,
          },
        });

        return result;
      }

      await router.push(
        this.userStore.user?.type === 1 ? '/mainportal/project' : '/organization/project',
      );
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      const projectId = this.getProjectId(params, result.data);

      if (formKey) {
        useFormsStore().clearFormData(formKey);
      }

      await router.push(
        projectId ? `${this.getPrefix()}/project/show/${projectId}` : `${this.getPrefix()}/project`,
      );
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
