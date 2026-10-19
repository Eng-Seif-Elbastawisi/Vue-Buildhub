import { shallowRef, type ShallowRef } from 'vue';
import BaseController from '@/base/Presentation/Controller/baseController';
import {
  DataInitial,
  DataLoading,
  DataSuccess,
  DataFailed,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import ScheduleRepository from '../../../Schedule/data/repositories/schedule.repository';
import WorkItemsRepository from '../../../WorkItems/data/repositories/work-items.repository';
import PurchaseRequestRepository from '../../../Procurement/data/repositories/purchase-request.repository';
import ExecutionQuoteRepository from '../../../data/repositories/execution.quote.repository';
import ShowExecutionQuoteParams from '../../../core/params/show.execution.quote.params';
import ScheduleOwnerParams from '../../../Schedule/core/params/schedule.owner.params';
import FetchWorkItemsParams from '../../../WorkItems/core/params/fetch.work-items.params';
import FetchPurchaseRequestsParams from '../../../Procurement/core/params/fetch.purchase-requests.params';
import type ExecutionQuoteShowModel from '../../../core/models/execution.quote.show.model';
import type ScheduleGroupModel from '../../../Schedule/core/models/schedule.group.model';
import type ProjectTimelineOverviewModel from '../../../Schedule/core/models/project.timeline.overview.model';
import type ScheduleSettingsModel from '../../../Schedule/core/models/schedule.settings.model';
import type DailyReportModel from '../../../WorkItems/core/models/report.model';
import type WorkTaskModel from '../../../WorkItems/core/models/task.model';
import type WorkActivityModel from '../../../WorkItems/core/models/activity.model';
import type ShopDrawingQuoteModel from '../../../WorkItems/core/models/shop-drawing.model';
import type PurchaseRequestModel from '../../../Procurement/core/models/purchase-request.model';

import {
  timelineDistribution,
  reportMetrics,
  activityDistribution,
  procurementDistribution,
  assignedTasks,
  type AnalyticsPeriod,
} from '../../core/models/analytics.metrics';

export type AnalyticsSource =
  'timelines' | 'configuration' | 'reports' | 'tasks' | 'activities' | 'drawings' | 'procurement';
export default class AnalyticsController extends BaseController<ScheduleGroupModel> {
  private static instance: AnalyticsController;
  private epoch = 0;
  private requests = new Map<AnalyticsSource, number>();
  readonly quoteId = shallowRef<number | null>(null);
  readonly owner = shallowRef<DataState<ExecutionQuoteShowModel>>(new DataInitial());
  readonly timelines = shallowRef<DataState<ProjectTimelineOverviewModel>>(new DataInitial());
  readonly configuration = shallowRef<DataState<ScheduleSettingsModel>>(new DataInitial());
  readonly reports = shallowRef<DataState<DailyReportModel[]>>(new DataInitial());
  readonly tasks = shallowRef<DataState<WorkTaskModel[]>>(new DataInitial());
  readonly activities = shallowRef<DataState<WorkActivityModel[]>>(new DataInitial());
  readonly drawings = shallowRef<DataState<ShopDrawingQuoteModel[]>>(new DataInitial());
  readonly procurement = shallowRef<DataState<PurchaseRequestModel[]>>(new DataInitial());
  readonly retrievedAt = shallowRef<string | null>(null);
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new AnalyticsController());
  }
  protected get repository() {
    return ScheduleRepository.getInstance();
  }
  get timelineBuckets() {
    return this.timelines.value instanceof DataSuccess && this.timelines.value.data
      ? timelineDistribution(this.timelines.value.data.projectTimelines)
      : null;
  }
  reportSummary(period: AnalyticsPeriod) {
    return this.reports.value instanceof DataSuccess && this.reports.value.data
      ? reportMetrics(this.reports.value.data, period)
      : null;
  }
  workMix(period: AnalyticsPeriod) {
    return this.activities.value instanceof DataSuccess && this.activities.value.data
      ? activityDistribution(this.activities.value.data, period)
      : null;
  }
  get procurementBuckets() {
    return this.procurement.value instanceof DataSuccess && this.procurement.value.data
      ? procurementDistribution(this.procurement.value.data)
      : null;
  }
  get taskAssignments() {
    return this.tasks.value instanceof DataSuccess && this.tasks.value.data
      ? assignedTasks(this.tasks.value.data)
      : null;
  }
  release() {
    this.epoch++;
    this.quoteId.value = null;
    this.requests.clear();
    this.owner.value = new DataInitial();
    this.timelines.value = new DataInitial();
    this.configuration.value = new DataInitial();
    this.reports.value = new DataInitial();
    this.tasks.value = new DataInitial();
    this.activities.value = new DataInitial();
    this.drawings.value = new DataInitial();
    this.procurement.value = new DataInitial();
    this.retrievedAt.value = null;
  }
  async activate(id: number, internalAccess: boolean) {
    this.release();
    if (!internalAccess || !Number.isSafeInteger(id) || id <= 0) return;
    this.quoteId.value = id;
    await this.refresh();
  }
  private invalid<T>(): DataState<T> {
    return new DataFailed({
      error: new ErrorModel('intelligence.invalid_source', ErrorType.dataDirty),
    });
  }
  async refresh() {
    const id = this.quoteId.value;
    if (id === null) return;
    // A new refresh supersedes every in-flight request, even for this same Quote.
    const epoch = ++this.epoch;
    this.owner.value = new DataLoading();
    this.timelines.value = new DataLoading();
    this.configuration.value = new DataLoading();
    this.reports.value = new DataLoading();
    this.tasks.value = new DataLoading();
    this.activities.value = new DataLoading();
    this.drawings.value = new DataLoading();
    this.procurement.value = new DataLoading();
    const owner = await ExecutionQuoteRepository.getInstance().show(
      new ShowExecutionQuoteParams({ executionQuoteId: id }),
      { useStaticData: false, enableRetry: false },
      false,
    );
    if (epoch !== this.epoch) return;
    this.owner.value =
      owner instanceof DataSuccess && (owner.data?.id !== id || !owner.data.project?.id)
        ? this.invalid()
        : owner;
    if (!(this.owner.value instanceof DataSuccess)) return;
    await Promise.all(
      (
        [
          'timelines',
          'configuration',
          'reports',
          'tasks',
          'activities',
          'drawings',
          'procurement',
        ] as const
      ).map((source) => this.load(source)),
    );
    if (epoch === this.epoch) this.retrievedAt.value = new Date().toISOString();
  }
  private hasUniqueIds(rows: readonly { id: number }[]) {
    return new Set(rows.map((row) => row.id)).size === rows.length;
  }
  private async read<T>(
    source: AnalyticsSource,
    state: ShallowRef<DataState<T>>,
    request: () => Promise<DataState<T>>,
    validate?: (value: T) => boolean,
  ) {
    const epoch = this.epoch;
    const sequence = (this.requests.get(source) ?? 0) + 1;
    this.requests.set(source, sequence);
    state.value = new DataLoading();
    let result: DataState<T>;
    try {
      result = await request();
    } catch {
      result = this.invalid();
    }
    if (epoch !== this.epoch || sequence !== this.requests.get(source)) return;
    state.value =
      result instanceof DataSuccess && result.data !== null && validate && !validate(result.data)
        ? this.invalid()
        : result;
  }
  async load(source: AnalyticsSource) {
    const id = this.quoteId.value;
    const projectId = this.owner.value.data?.project?.id;
    if (id === null || !(this.owner.value instanceof DataSuccess) || !projectId) return;
    const work = WorkItemsRepository.getInstance();
    const params = new FetchWorkItemsParams(id);
    switch (source) {
      case 'timelines':
        return this.read(
          source,
          this.timelines,
          () => this.repository.readOverview(new ScheduleOwnerParams(id)),
          (value) =>
            value.count === value.projectTimelines.length &&
            new Set(value.projectTimelines.map((group) => group.id)).size ===
              value.projectTimelines.length,
        );
      case 'configuration':
        return this.read(source, this.configuration, () =>
          this.repository.readSettings(new ScheduleOwnerParams(id)),
        );
      case 'reports':
        return this.read(
          source,
          this.reports,
          () => work.fetchReports(params),
          (rows) => this.hasUniqueIds(rows),
        );
      case 'tasks':
        return this.read(
          source,
          this.tasks,
          () => work.fetchTasks(params),
          (rows) => this.hasUniqueIds(rows),
        );
      case 'activities':
        return this.read(
          source,
          this.activities,
          () => work.fetchActivities(params),
          (rows) => this.hasUniqueIds(rows),
        );
      case 'drawings':
        return this.read(
          source,
          this.drawings,
          () => work.fetchDrawings(params),
          (rows) =>
            this.hasUniqueIds(rows) &&
            rows.every(
              (row) =>
                row.quoteId === id && (row.projectId === null || row.projectId === projectId),
            ),
        );
      case 'procurement':
        return this.read(
          source,
          this.procurement,
          () => PurchaseRequestRepository.getInstance().index(new FetchPurchaseRequestsParams(id)),
          (rows) =>
            this.hasUniqueIds(rows) &&
            rows.every((row) => row.quoteId === id && row.projectId === projectId),
        );
    }
  }
}
