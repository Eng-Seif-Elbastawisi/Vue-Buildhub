import BaseApiService from '@/base/Data/ApiService/baseApiService';
import { CrudType } from '@/base/Data/ApiService/apiServiceInterface';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import type Params from '@/base/Core/Params/params';
import type QuoteSiteTeamParams from '../../core/params/quote.site-team.params';
import type AssignQuoteEngineersParams from '../../core/params/assign.quote.engineers.params';
import type UpdateProjectSiteInfoParams from '../../core/params/update.project.site-info.params';
import { SiteTeamEndpoints } from './site-team.api.endpoints';
export default class SiteTeamApiService extends BaseApiService {
  private static instance: SiteTeamApiService;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new SiteTeamApiService());
  }
  protected get endpoints() {
    return {};
  }
  private request(url: string, params: Params) {
    const validation = params.validate();
    if (!validation.isValid) {
      const errors: Record<string, string[]> = {};
      validation.errors.forEach((error) => (errors[error.field] ??= []).push(error.message));
      throw new ValidationException('site_team.invalid_form', errors);
    }
    return this.custom<unknown>(
      { url, method: CrudType.POST, params },
      { useJson: true, usePost: true, auth: true, enableRetry: false, useStaticData: false },
      false,
    );
  }
  fetchEngineers(params: QuoteSiteTeamParams) {
    return this.request(new SiteTeamEndpoints().engineers, params);
  }
  assignEngineers(params: AssignQuoteEngineersParams) {
    return this.request(new SiteTeamEndpoints().assignEngineers, params);
  }
  fetchSiteInfo(params: QuoteSiteTeamParams) {
    return this.request(new SiteTeamEndpoints().siteInfo, params);
  }
  updateSiteInfo(params: UpdateProjectSiteInfoParams) {
    return this.request(new SiteTeamEndpoints().updateSiteInfo, params);
  }
}
