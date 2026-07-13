import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import {
  DataFailed,
  DataInitial,
  DataLoading,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ErrorModel } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import type ProjectHistoryModel from '../../core/models/project.history.model';
import type ProjectModel from '../../core/models/project.model';
import type ProjectShowModel from '../../core/models/project.show.model';
import ProjectRepository from '../../data/repositories/project.repository';
import { useUserStore } from '@/stores/user';
import type ShowProjectParams from '../../core/params/show.project.params';

type ProjectActionParams = Params | Record<string, unknown>;

export default class ProjectController extends BaseController<ProjectShowModel, ProjectModel[]> {
  private static instance: ProjectController;
  public historyState: Ref<DataState<ProjectHistoryModel>> = ref(
    new DataInitial<ProjectHistoryModel>(null),
  ) as Ref<DataState<ProjectHistoryModel>>;

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
    if (!ProjectController.instance) {
      ProjectController.instance = new ProjectController();
    }

    return ProjectController.instance;
  }

  private getPrefix(): string {
    return this.userStore.user?.type === 1 ? '/mainportal' : '/organization';
  }

  private getProjectIdFromResult(result: DataSuccess<ProjectShowModel>): number | undefined {
    const data = result.data as ProjectShowModel | undefined;

    return data?.id;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      const projectId = this.getProjectIdFromResult(result as DataSuccess<ProjectShowModel>);

      if (formKey) {
        useFormsStore().clearFormData(formKey);
      }

      if (projectId) {
        router.push({
          name: 'add-project_preview',
          query: {
            project_id: projectId,
          },
        });

        return result;
      }

      router.push(`${this.getPrefix()}/project`);
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      router.push(`${this.getPrefix()}/project`);

      if (formKey) {
        useFormsStore().clearFormData(formKey);
      }
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

  private handleProjectActionResponse(result: DataState<void>): DataState<void> {
    if (result.hasError) {
      this.handleErrorResponse(result);
    }

    return result;
  }

  async convertMeasurementToProject(params?: ProjectActionParams): Promise<DataState<void>> {
    const result = await this.repository.convertMeasurementToProject(params);

    return this.handleProjectActionResponse(result);
  }
  async storeVersion(params?: ProjectActionParams): Promise<DataState<void>> {
    const result = await this.repository.storeVersion(params);

    return this.handleProjectActionResponse(result);
  }
  async reviseVersion(params?: ProjectActionParams): Promise<DataState<void>> {
    const result = await this.repository.reviseVersion(params);

    return this.handleProjectActionResponse(result);
  }

  get historyData(): ComputedRef<ProjectHistoryModel | null> {
    return computed(() => {
      if (this.historyState.value instanceof DataSuccess) {
        return this.historyState.value.data;
      }

      return null;
    });
  }

  async fetchProjectStatusHistories(params: Params): Promise<DataState<ProjectHistoryModel>> {
    this.historyState.value = new DataLoading<ProjectHistoryModel>();

    try {
      const result = await this.repository.fetchProjectStatusHistories(params);
      this.historyState.value = result;

      if (result.hasError) {
        this.handleErrorResponse(result);
      }

      return result;
    } catch (error) {
      const failed = new DataFailed<ProjectHistoryModel>({ error: error as ErrorModel });
      this.historyState.value = failed;
      this.handleErrorResponse(failed);

      return failed;
    }
  }
}
