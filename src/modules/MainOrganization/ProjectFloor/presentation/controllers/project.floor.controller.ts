import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type ProjectFloorModel from '../../core/models/project.floor.model';
import type ProjectFloorShowModel from '../../core/models/project.floor.show.model';
import ProjectFloorRepository from '../../data/repositories/project.floor.repository';
import type ShowProjectFloorParams from '../../core/params/show.project.floor.params';

export default class ProjectFloorController extends BaseController<
  ProjectFloorShowModel,
  ProjectFloorModel[]
> {
  private static instance: ProjectFloorController;

  protected get repository() {
    return ProjectFloorRepository.getInstance();
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
  static getInstance(): ProjectFloorController {
    if (!ProjectFloorController.instance)
      ProjectFloorController.instance = new ProjectFloorController();
    return ProjectFloorController.instance;
  }

  private getPositiveInteger(value: unknown): number | undefined {
    const numberValue = Number(value);

    return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
  }

  private getProjectId(params: Params, data?: ProjectFloorShowModel | null): number | undefined {
    return (
      this.getPositiveInteger(data?.project_id) ??
      this.getPositiveInteger(data?.project?.id) ??
      this.getPositiveInteger(params.toMap().project_id)
    );
  }

  private getProjectFloorId(
    params: Params,
    data?: ProjectFloorShowModel | null,
  ): number | undefined {
    return this.getPositiveInteger(data?.id) ?? this.getPositiveInteger(params.toMap().id);
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
      // router.push(
      //   this.userStore.user?.type === 1
      //     ? '/mainportal/project-floor'
      //     : '/organization/project-floor',
      // );

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async updateWithoutNavigation(params: Params, options?: ApiCallOptions) {
    return await super.update(params, { ...options, useJson: true });
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await this.updateWithoutNavigation(params, options);
    if (result instanceof DataSuccess) {
      const projectId = this.getProjectId(params, result.data);
      const projectFloorId = this.getProjectFloorId(params, result.data);

      if (formKey) useFormsStore().clearFormData(formKey);

      if (projectId) {
        await router.push({ name: 'show-project', params: { project_id: projectId } });
      } else if (projectFloorId) {
        await router.push({
          name: 'show-project_floor',
          params: { project_floor_id: projectFloorId },
        });
      } else {
        await router.push({ name: 'project' });
      }
    }
    return result;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<ProjectFloorModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowProjectFloorParams).allLocales ? '*' : 'en',
      },
    });
  }
  async getProject(params?: Params) {
    return await this.repository.getProject(params);
  }
}
