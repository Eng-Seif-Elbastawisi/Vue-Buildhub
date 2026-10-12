import BaseRepository from '@/base/Domain/Repositories/baseRepository';
import {
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiResponse } from '@/base/Data/ApiService/baseApiService';
import SiteTeamApiService from '../api/site-team.api-service';
import ProjectSiteInfoModel from '../../core/models/project.site-info.model';
import QuoteEngineersModel from '../../core/models/quote.engineers.model';
import type QuoteSiteTeamParams from '../../core/params/quote.site-team.params';
import type AssignQuoteEngineersParams from '../../core/params/assign.quote.engineers.params';
import type UpdateProjectSiteInfoParams from '../../core/params/update.project.site-info.params';
export default class SiteTeamRepository extends BaseRepository<ProjectSiteInfoModel> {
  private static instance: SiteTeamRepository;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new SiteTeamRepository());
  }
  protected get apiService() {
    return SiteTeamApiService.getInstance();
  }
  protected parseItem(data: unknown) {
    return ProjectSiteInfoModel.fromJson(data);
  }
  protected parseList(data: unknown) {
    return Array.isArray(data) ? data.map(ProjectSiteInfoModel.fromJson) : [];
  }
  private envelope(response: ApiResponse<unknown>): Record<string, unknown> {
    const body = response.data;
    if (
      response.statusCode < 200 ||
      response.statusCode >= 300 ||
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    )
      throw new Error('site_team.invalid_response');
    const envelope = body as Record<string, unknown>;
    if (envelope.status !== true)
      throw new Error(
        typeof envelope.message === 'string' ? envelope.message : 'site_team.invalid_response',
      );
    return envelope;
  }
  async fetchSiteInfo(params: QuoteSiteTeamParams): Promise<DataState<ProjectSiteInfoModel>> {
    try {
      return new DataSuccess({
        data: this.parseItem(this.envelope(await this.apiService.fetchSiteInfo(params)).data),
      });
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }
  async fetchEngineers(params: QuoteSiteTeamParams): Promise<DataState<QuoteEngineersModel[]>> {
    try {
      const envelope = this.envelope(await this.apiService.fetchEngineers(params));
      // The employee collection is confirmed; its envelope location still needs a backend fixture.
      console.log('fetchEngineers', envelope);
      const payload = envelope.employee !== undefined ? envelope : envelope.data;
      return new DataSuccess({ data: payload.map((entry) => QuoteEngineersModel.fromJson(entry)) });
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }
  async assignEngineers(params: AssignQuoteEngineersParams): Promise<DataState<void>> {
    try {
      this.envelope(await this.apiService.assignEngineers(params));
      return new DataSuccess<void>({});
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }
  async updateSiteInfo(params: UpdateProjectSiteInfoParams): Promise<DataState<void>> {
    try {
      this.envelope(await this.apiService.updateSiteInfo(params));
      return new DataSuccess<void>({});
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }
}
