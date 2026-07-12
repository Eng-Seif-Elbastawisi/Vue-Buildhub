import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataFailed, DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type { ApiResponse } from '@/base/Data/ApiService/baseApiService';
import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import { HttpStatusCode } from 'axios';
import ProjectModel from '../../core/models/project.model';
import ProjectShowModel from '../../core/models/project.show.model';
import ProjectApiService from '../api/project.api-service';

type ProjectActionResponse = {
  status?: boolean;
  message?: string;
};

export default class ProjectRepository extends BaseRepository<ProjectShowModel, ProjectModel[]> {
  private static instance: ProjectRepository;
  protected get apiService() {
    return ProjectApiService.getInstance();
  }
  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }
  protected get mockItem() {
    return ProjectShowModel.example;
  }
  protected get mockList() {
    return [ProjectModel.example];
  }

  static getInstance(): ProjectRepository {
    if (!ProjectRepository.instance) ProjectRepository.instance = new ProjectRepository();
    return ProjectRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): ProjectShowModel {
    return ProjectShowModel.fromJson(data);
  }
  protected parseList(data: unknown): ProjectModel[] {
    return Array.isArray(data) ? data.map((item) => ProjectModel.fromJson(item)) : [];
  }

  private processProjectActionResponse(
    response: ApiResponse<ProjectActionResponse>,
  ): DataState<void> {
    const isSuccess =
      [HttpStatusCode.Ok, HttpStatusCode.Created, HttpStatusCode.Accepted].includes(
        response.statusCode,
      ) && (response.data.status ?? true);

    if (isSuccess) {
      return new DataSuccess<void>({
        message: response.data.message,
      });
    }

    return new DataFailed({
      error: new ErrorModel(response.data.message ?? 'error.retry_later', ErrorType.serviceSide),
    });
  }

  private async executeProjectAction(
    apiCall: () => Promise<ApiResponse<ProjectActionResponse>>,
  ): Promise<DataState<void>> {
    try {
      return this.processProjectActionResponse(await apiCall());
    } catch (error) {
      return this.handleError<void>(error);
    }
  }

  async convertMeasurementToProject(params?: Record<string, unknown>): Promise<DataState<void>> {
    return await this.executeProjectAction(() =>
      this.apiService.convertMeasurementToProject(params as any),
    );
  }
  async storeVersion(params?: Record<string, unknown>): Promise<DataState<void>> {
    return await this.executeProjectAction(() => this.apiService.storeVersion(params as any));
  }
  async reviseVersion(params?: Record<string, unknown>): Promise<DataState<void>> {
    return await this.executeProjectAction(() => this.apiService.reviseVersion(params as any));
  }
}
