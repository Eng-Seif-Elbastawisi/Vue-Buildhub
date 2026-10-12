import BaseApiService from '@/base/Data/ApiService/baseApiService';
import { CrudType } from '@/base/Data/ApiService/apiServiceInterface';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import type Params from '@/base/Core/Params/params';
import type FetchWorkItemsParams from '../../core/params/fetch.work-items.params';
import type StoreTaskParams from '../../core/params/store.task.params';
import type StoreReportParams from '../../core/params/store.report.params';
import type StoreActivityParams from '../../core/params/store.activity.params';
import type StoreShopDrawingQuoteParams from '../../core/params/store.shop-drawing.params';
import { WorkItemsEndpoints } from './work-items.api.endpoints';
export default class WorkItemsApiService extends BaseApiService {
  private static instance: WorkItemsApiService;
  private readonly workItemsEndpoints = new WorkItemsEndpoints();
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new WorkItemsApiService());
  }
  protected get endpoints() {
    return {};
  }
  private request(url: string, params: Params) {
    const validation = params.validate();
    if (!validation.isValid) {
      const errors: Record<string, string[]> = {};
      validation.errors.forEach((error) => (errors[error.field] ??= []).push(error.message));
      throw new ValidationException('work_items.invalid_form', errors);
    }
    return this.custom<unknown>(
      { url, method: CrudType.POST, params },
      { useJson: true, auth: true, enableRetry: false, useStaticData: false },
      false,
    );
  }
  fetchDrawings(params: FetchWorkItemsParams) {
    return this.request(this.workItemsEndpoints.fetchDrawings, params);
  }
  storeDrawing(params: StoreShopDrawingQuoteParams) {
    return this.request(this.workItemsEndpoints.storeDrawing, params);
  }
  fetchTasks(params: FetchWorkItemsParams) {
    return this.request(this.workItemsEndpoints.fetchTasks, params);
  }
  fetchReports(params: FetchWorkItemsParams) {
    return this.request(this.workItemsEndpoints.fetchReports, params);
  }
  fetchActivities(params: FetchWorkItemsParams) {
    return this.request(this.workItemsEndpoints.fetchActivities, params);
  }
  storeTask(params: StoreTaskParams) {
    return this.request(this.workItemsEndpoints.storeTask, params);
  }
  storeReport(params: StoreReportParams) {
    return this.request(this.workItemsEndpoints.storeReport, params);
  }
  storeActivity(params: StoreActivityParams) {
    return this.request(this.workItemsEndpoints.storeActivity, params);
  }
}
