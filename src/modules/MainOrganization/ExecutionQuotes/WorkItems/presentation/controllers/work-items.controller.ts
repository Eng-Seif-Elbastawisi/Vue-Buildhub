import { computed, shallowRef } from 'vue';
import BaseController from '@/base/Presentation/Controller/baseController';
import {
  DataInitial,
  DataLoading,
  DataSuccess,
  DataCancelled,
  DataFailed,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import TitleInterface from '@/base/Data/Models/titleInterface';
import ExecutionQuoteRepository from '../../../data/repositories/execution.quote.repository';
import ShowExecutionQuoteParams from '../../../core/params/show.execution.quote.params';
import ProjectFloorRepository from '@/modules/MainOrganization/ProjectFloor/data/repositories/project.floor.repository';
import IndexProjectFloorParams from '@/modules/MainOrganization/ProjectFloor/core/params/index.project.floor.params';
import type ProjectFloorModel from '@/modules/MainOrganization/ProjectFloor/core/models/project.floor.model';
import type Params from '@/base/Core/Params/params';
import type EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import EmployeeRepository from '@/modules/MainOrganization/employee/data/repositories/employee.repository';
import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
import ScheduleRepository from '../../../Schedule/data/repositories/schedule.repository';
import { TimelineWorkStatus } from '../../../Schedule/core/constants/timeline.status';
import type ScheduleGroupModel from '../../../Schedule/core/models/schedule.group.model';
import type WorkTaskModel from '../../core/models/task.model';
import type DailyReportModel from '../../core/models/report.model';
import type WorkActivityModel from '../../core/models/activity.model';
import FetchWorkItemsParams from '../../core/params/fetch.work-items.params';
import type StoreTaskParams from '../../core/params/store.task.params';
import type StoreReportParams from '../../core/params/store.report.params';
import type StoreActivityParams from '../../core/params/store.activity.params';
import { positiveId } from '../../core/constants/work-items.constants';
import type ShopDrawingQuoteModel from '../../core/models/shop-drawing.model';
import type StoreShopDrawingQuoteParams from '../../core/params/store.shop-drawing.params';
import WorkItemsRepository from '../../data/repositories/work-items.repository';
export default class WorkItemsController extends BaseController<WorkTaskModel> {
  private static instance: WorkItemsController;
  private epoch = 0;
  private requests = new Map<string, number>();
  readonly floorsState = shallowRef<DataState<ProjectFloorModel[]>>(new DataInitial());
  readonly spaceOptions = computed(() =>
    (this.floorsState.value.data ?? []).flatMap((floor) =>
      floor.spaces
        .filter((space) => positiveId(space.id))
        .map((space) => new TitleInterface({ id: Number(space.id), title: space.space.title })),
    ),
  );
  readonly quoteId = shallowRef<number | null>(null);
  readonly stagesState = shallowRef<DataState<ScheduleGroupModel[]>>(new DataInitial());
  readonly employeesState = shallowRef<DataState<EmployeeModel[]>>(new DataInitial());
  readonly stages = computed(() =>
    (this.stagesState.value.data ?? [])
      .filter((group) => group.workStatus === TimelineWorkStatus.START)
      .flatMap((group) =>
        group.stages.map(
          (stage) => new TitleInterface({ id: stage.id, title: `${group.title} · ${stage.title}` }),
        ),
      ),
  );
  readonly employeeOptions = {
    fetchAsOptions: (params?: Params) => this.loadEmployees(params),
    isListFailed: () => this.employeesState.value.hasError,
    isListSuccess: () => this.employeesState.value instanceof DataSuccess,
    pagination: computed(() => this.employeesState.value.pagination),
  };
  readonly drawingStages = computed(() =>
    (this.stagesState.value.data ?? [])
      .filter((group) => group.workStatus === TimelineWorkStatus.START)
      .flatMap((group) =>
        group.stages
          .map(
            (stage) =>
              new TitleInterface({ id: stage.id, title: `${group.title} · ${stage.title}` }),
          ),
      ),
  );
  readonly drawingsState = shallowRef<DataState<ShopDrawingQuoteModel[]>>(new DataInitial());
  readonly drawingsSaveState = shallowRef<DataState<void>>(new DataInitial());
  readonly tasksState = shallowRef<DataState<WorkTaskModel[]>>(new DataInitial());
  readonly tasksSaveState = shallowRef<DataState<void>>(new DataInitial());
  readonly reportsState = shallowRef<DataState<DailyReportModel[]>>(new DataInitial());
  readonly reportsSaveState = shallowRef<DataState<void>>(new DataInitial());
  readonly activitiesState = shallowRef<DataState<WorkActivityModel[]>>(new DataInitial());
  readonly activitiesSaveState = shallowRef<DataState<void>>(new DataInitial());
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new WorkItemsController());
  }
  protected get repository() {
    return WorkItemsRepository.getInstance();
  }
  protected get config() {
    return { autoRetry: false, showSuccessTosat: true };
  }
  activate(quoteId: number) {
    this.release();
    if (positiveId(quoteId)) this.quoteId.value = quoteId;
  }
  release() {
    this.epoch++;
    this.quoteId.value = null;
    this.requests.clear();
    this.stagesState.value = new DataInitial();
    this.floorsState.value = new DataInitial();
    this.employeesState.value = new DataInitial();
    this.drawingsState.value = new DataInitial();
    this.drawingsSaveState.value = new DataInitial();
    this.tasksState.value = new DataInitial();
    this.tasksSaveState.value = new DataInitial();
    this.reportsState.value = new DataInitial();
    this.reportsSaveState.value = new DataInitial();
    this.activitiesState.value = new DataInitial();
    this.activitiesSaveState.value = new DataInitial();
  }
  private requestScope(key: string) {
    const epoch = this.epoch;
    const request = (this.requests.get(key) ?? 0) + 1;
    this.requests.set(key, request);
    return () => epoch === this.epoch && request === this.requests.get(key);
  }
  async load() {
    await Promise.all([
      this.loadTasks(),
      this.loadReports(),
      this.loadActivities(),
      this.loadStages(),
    ]);
  }
  async loadSpaces() {
    const quoteId = this.quoteId.value;
    if (quoteId === null) return;
    const current = this.requestScope('spaces');
    this.floorsState.value = new DataLoading();
    const owner = await ExecutionQuoteRepository.getInstance().show(
      new ShowExecutionQuoteParams({ executionQuoteId: quoteId }),
      { useStaticData: false, enableRetry: false },
      false,
    );
    if (!current()) return;
    const projectId = owner.data?.project?.id;
    if (
      !(owner instanceof DataSuccess) ||
      (owner.data?.id !== undefined && owner.data.id !== quoteId) ||
      !positiveId(projectId)
    ) {
      this.floorsState.value = new DataFailed({
        error:
          owner.error ?? new ErrorModel('procurement.floor_ownership_error', ErrorType.validation),
      });
      return;
    }
    const floors = await ProjectFloorRepository.getInstance().index(
      new IndexProjectFloorParams('', 1, 10, 0, undefined, Number(projectId)),
      { useStaticData: false, enableRetry: false },
      false,
    );
    if (!current()) return;
    this.floorsState.value = floors.data?.some(
      (floor) =>
        (floor.project?.id ?? floor.project_id) !== undefined &&
        (floor.project?.id ?? floor.project_id) !== Number(projectId),
    )
      ? new DataFailed({
        error: new ErrorModel('procurement.floor_ownership_error', ErrorType.validation),
      })
      : floors;
  }
  async loadStages() {
    if (this.quoteId.value === null) return;
    const current = this.requestScope('stages');
    this.stagesState.value = new DataLoading();
    const overview = await ScheduleRepository.getInstance().fetchStartedProjectTimelines(
      this.quoteId.value,
    );
    // console.log('overview', overview.data.projectTimelines);
    if (!current()) return;
    this.stagesState.value =
      overview instanceof DataSuccess && overview.data
        ? new DataSuccess({ data: overview.data.projectTimelines })
        : new DataFailed({ error: overview.error });
  }
  async loadEmployees(params?: Params): Promise<TitleInterface<string | number>[]> {
    if (this.quoteId.value === null || !(params instanceof IndexEmployeeParams)) return [];
    const current = this.requestScope('employees');
    this.employeesState.value = new DataLoading();
    const employees = await EmployeeRepository.getInstance().index(
      params,
      { useStaticData: false, enableRetry: false },
      false,
    );
    if (!current()) return [];
    this.employeesState.value = employees;
    return (employees.data ?? [])
      .filter((employee) => positiveId(employee.id))
      .map((employee) => new TitleInterface({ id: Number(employee.id), title: employee.name }));
  }
  private ownsStage(stageId: number) {
    return this.quoteId.value !== null && this.stages.value.some((stage) => stage.id === stageId);
  }
  private invalidStage() {
    return new DataFailed<void>({
      error: new ErrorModel('work_items.invalid_stage', ErrorType.validation),
    });
  }
  async loadDrawings() {
    if (this.quoteId.value === null) return;
    const current = this.requestScope('drawings');
    const quoteId = this.quoteId.value;
    this.drawingsState.value = new DataLoading();
    const records = await this.repository.fetchDrawings(new FetchWorkItemsParams(quoteId));
    if (!current()) return;
    this.drawingsState.value = records.data?.some((drawing) => drawing.quoteId !== quoteId)
      ? new DataFailed({
        error: new ErrorModel('work_items.invalid_response', ErrorType.validation),
      })
      : records;
  }
  async saveDrawing(params: StoreShopDrawingQuoteParams): Promise<DataState<void>> {
    if (this.drawingsSaveState.value instanceof DataLoading) return new DataCancelled();
    if (
      params.fields.quoteId !== this.quoteId.value ||
      !params.fields.projectTimelineStageIds.length ||
      params.fields.projectTimelineStageIds.some(
        (id) => !this.drawingStages.value.some((stage) => stage.id === id),
      )
    ) {
      const failure = this.invalidStage();
      this.drawingsSaveState.value = failure;
      return failure;
    }
    const ownerEpoch = this.epoch;
    this.drawingsSaveState.value = new DataLoading();
    await this.loadStages();
    if (ownerEpoch !== this.epoch) return new DataCancelled();
    const ids = params.fields.projectTimelineStageIds;
    if (
      (params.fields.projectFloorSpaceId != null &&
        !this.spaceOptions.value.some((space) => space.id === params.fields.projectFloorSpaceId)) ||
      params.fields.quoteId !== this.quoteId.value ||
      !ids.length ||
      ids.some((id) => !this.drawingStages.value.some((stage) => stage.id === id))
    ) {
      const failure = this.invalidStage();
      this.drawingsSaveState.value = failure;
      return failure;
    }
    const epoch = this.epoch;
    this.drawingsSaveState.value = new DataLoading();
    const saved = await this.repository.storeDrawing(params);
    if (epoch !== this.epoch) return new DataCancelled();
    if (saved instanceof DataSuccess) {
      await this.loadDrawings();
      if (epoch !== this.epoch) return new DataCancelled();
      this.showSuccessToast('work_items.drawing_saved');
    }
    this.drawingsSaveState.value = saved;
    return saved;
  }
  async loadTasks() {
    if (this.quoteId.value === null) return;
    const current = this.requestScope('tasks');
    this.tasksState.value = new DataLoading();
    const records = await this.repository.fetchTasks(new FetchWorkItemsParams(this.quoteId.value));
    if (current()) this.tasksState.value = records;
  }
  async saveTask(params: StoreTaskParams): Promise<DataState<void>> {
    if (this.tasksSaveState.value instanceof DataLoading) return new DataCancelled();
    if (!this.ownsStage(params.projectTimelineStageId)) {
      const failure = this.invalidStage();
      this.tasksSaveState.value = failure;
      return failure;
    }
    const ownerEpoch = this.epoch;
    this.tasksSaveState.value = new DataLoading();
    await this.loadStages();
    if (ownerEpoch !== this.epoch) return new DataCancelled();
    if (!this.ownsStage(params.projectTimelineStageId)) {
      const failure = this.invalidStage();
      this.tasksSaveState.value = failure;
      return failure;
    }
    const epoch = this.epoch;
    this.tasksSaveState.value = new DataLoading();
    const saved = await this.repository.storeTask(params);
    if (epoch !== this.epoch) return new DataCancelled();
    if (saved instanceof DataSuccess) {
      this.showSuccessToast('work_items.saved');
      await this.loadTasks();
      if (epoch !== this.epoch) return new DataCancelled();
    }
    this.tasksSaveState.value = saved;
    return saved;
  }
  async loadReports() {
    if (this.quoteId.value === null) return;
    const current = this.requestScope('reports');
    this.reportsState.value = new DataLoading();
    const records = await this.repository.fetchReports(
      new FetchWorkItemsParams(this.quoteId.value),
    );
    if (current()) this.reportsState.value = records;
  }
  async saveReport(params: StoreReportParams): Promise<DataState<void>> {
    if (this.reportsSaveState.value instanceof DataLoading) return new DataCancelled();
    if (!this.ownsStage(params.projectTimelineStageId)) {
      const failure = this.invalidStage();
      this.reportsSaveState.value = failure;
      return failure;
    }
    const ownerEpoch = this.epoch;
    this.reportsSaveState.value = new DataLoading();
    await this.loadStages();
    if (ownerEpoch !== this.epoch) return new DataCancelled();
    if (
      !this.ownsStage(params.projectTimelineStageId) ||
      (params.reportScopeType === 2 &&
        !this.spaceOptions.value.some((space) => space.id === params.projectFloorSpaceId))
    ) {
      const failure = this.invalidStage();
      this.reportsSaveState.value = failure;
      return failure;
    }
    const epoch = this.epoch;
    this.reportsSaveState.value = new DataLoading();
    const saved = await this.repository.storeReport(params);
    if (epoch !== this.epoch) return new DataCancelled();
    if (saved instanceof DataSuccess) {
      this.showSuccessToast('work_items.saved');
      await this.loadReports();
      if (epoch !== this.epoch) return new DataCancelled();
    }
    this.reportsSaveState.value = saved;
    return saved;
  }
  async loadActivities() {
    if (this.quoteId.value === null) return;
    const current = this.requestScope('activities');
    this.activitiesState.value = new DataLoading();
    const records = await this.repository.fetchActivities(
      new FetchWorkItemsParams(this.quoteId.value),
    );
    if (current()) this.activitiesState.value = records;
  }
  async saveActivity(params: StoreActivityParams): Promise<DataState<void>> {
    if (this.activitiesSaveState.value instanceof DataLoading) return new DataCancelled();
    if (!this.ownsStage(params.fields.projectTimelineStageId)) {
      const failure = this.invalidStage();
      this.activitiesSaveState.value = failure;
      return failure;
    }
    const ownerEpoch = this.epoch;
    this.activitiesSaveState.value = new DataLoading();
    await this.loadStages();
    if (ownerEpoch !== this.epoch) return new DataCancelled();
    if (!this.ownsStage(params.fields.projectTimelineStageId)) {
      const failure = this.invalidStage();
      this.activitiesSaveState.value = failure;
      return failure;
    }
    const epoch = this.epoch;
    this.activitiesSaveState.value = new DataLoading();
    const saved = await this.repository.storeActivity(params);
    if (epoch !== this.epoch) return new DataCancelled();
    if (saved instanceof DataSuccess) {
      this.showSuccessToast('work_items.saved');
      await this.loadActivities();
      if (epoch !== this.epoch) return new DataCancelled();
    }
    this.activitiesSaveState.value = saved;
    return saved;
  }
}
