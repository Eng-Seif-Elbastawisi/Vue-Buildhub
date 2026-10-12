import BaseRepository from '@/base/Domain/Repositories/baseRepository';
import {
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiResponse } from '@/base/Data/ApiService/baseApiService';
import WorkTaskModel from '../../core/models/task.model';
import DailyReportModel from '../../core/models/report.model';
import WorkActivityModel from '../../core/models/activity.model';
import { responseObject } from '../../core/models/work-items.response';
import type FetchWorkItemsParams from '../../core/params/fetch.work-items.params';
import type StoreTaskParams from '../../core/params/store.task.params';
import type StoreReportParams from '../../core/params/store.report.params';
import type StoreActivityParams from '../../core/params/store.activity.params';
import ShopDrawingQuoteModel from '../../core/models/shop-drawing.model';
import type StoreShopDrawingQuoteParams from '../../core/params/store.shop-drawing.params';
import WorkItemsApiService from '../api/work-items.api-service';
export default class WorkItemsRepository extends BaseRepository<WorkTaskModel> {
  private static instance: WorkItemsRepository;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new WorkItemsRepository());
  }
  protected get apiService() {
    return WorkItemsApiService.getInstance();
  }
  protected parseItem(payload: unknown) {
    return WorkTaskModel.fromJson(payload);
  }
  protected parseList(payload: unknown) {
    if (!Array.isArray(payload)) throw new Error('work_items.invalid_response');
    return payload.map(WorkTaskModel.fromJson);
  }
  private envelope(response: ApiResponse<unknown>) {
    const body = responseObject(response.data);
    if (response.statusCode < 200 || response.statusCode >= 300 || body.status !== true)
      throw new Error(
        typeof body.message === 'string' ? body.message : 'work_items.invalid_response',
      );
    return body;
  }
  private async readList<T>(
    request: () => Promise<ApiResponse<unknown>>,
    mapper: (payload: unknown) => T,
  ): Promise<DataState<T[]>> {
    try {
      const body = this.envelope(await request());
      if (!Array.isArray(body.data)) throw new Error('work_items.invalid_response');
      return new DataSuccess({ data: body.data.map(mapper) });
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }
  private async store(request: () => Promise<ApiResponse<unknown>>): Promise<DataState<void>> {
    try {
      // Store bodies are not documented. Require explicit status; never synthesize a saved record.
      this.envelope(await request());
      return new DataSuccess<void>({});
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }
  fetchDrawings(params: FetchWorkItemsParams) {
    return this.readList(
      () => this.apiService.fetchDrawings(params),
      ShopDrawingQuoteModel.fromJson,
    );
  }
  storeDrawing(params: StoreShopDrawingQuoteParams) {
    return this.store(() => this.apiService.storeDrawing(params));
  }
  fetchTasks(params: FetchWorkItemsParams) {
    return this.readList(() => this.apiService.fetchTasks(params), WorkTaskModel.fromJson);
  }
  fetchReports(params: FetchWorkItemsParams) {
    return this.readList(() => this.apiService.fetchReports(params), DailyReportModel.fromJson);
  }
  fetchActivities(params: FetchWorkItemsParams) {
    return this.readList(() => this.apiService.fetchActivities(params), WorkActivityModel.fromJson);
  }
  storeTask(params: StoreTaskParams) {
    return this.store(() => this.apiService.storeTask(params));
  }
  storeReport(params: StoreReportParams) {
    return this.store(() => this.apiService.storeReport(params));
  }
  storeActivity(params: StoreActivityParams) {
    return this.store(() => this.apiService.storeActivity(params));
  }
}
