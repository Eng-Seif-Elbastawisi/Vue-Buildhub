import { computed, shallowRef } from 'vue';
import BaseController from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import {
  DataInitial,
  DataEmpty,
  DataLoading,
  DataSuccess,
  DataCancelled,
  DataFailed,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import TitleInterface from '@/base/Data/Models/titleInterface';
import type ProjectSiteInfoModel from '../../core/models/project.site-info.model';
import type QuoteEngineersModel from '../../core/models/quote.engineers.model';
import QuoteSiteTeamParams, { positiveId } from '../../core/params/quote.site-team.params';
import type AssignQuoteEngineersParams from '../../core/params/assign.quote.engineers.params';
import type UpdateProjectSiteInfoParams from '../../core/params/update.project.site-info.params';
import SiteTeamRepository from '../../data/repositories/site-team.repository';
import ExecutionQuoteRepository from '../../../data/repositories/execution.quote.repository';
import ShowExecutionQuoteParams from '../../../core/params/show.execution.quote.params';
import type ExecutionQuoteShowModel from '../../../core/models/execution.quote.show.model';
import EmployeeRepository from '@/modules/MainOrganization/employee/data/repositories/employee.repository';
import type EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
import SpaceRepository from '@/modules/shared/Space/data/repositories/space.repository';
import type SpaceModel from '@/modules/shared/Space/core/models/space.model';
import IndexSpaceParams from '@/modules/shared/Space/core/params/index.space.params';
import ProjectFloorRepository from '@/modules/MainOrganization/ProjectFloor/data/repositories/project.floor.repository';
import ProjectFloorController from '@/modules/MainOrganization/ProjectFloor/presentation/controllers/project.floor.controller';
import IndexProjectFloorParams from '@/modules/MainOrganization/ProjectFloor/core/params/index.project.floor.params';
import type ProjectFloorModel from '@/modules/MainOrganization/ProjectFloor/core/models/project.floor.model';
import type AddProjectFloorSpacesParams from '@/modules/MainOrganization/ProjectFloor/core/params/add.project.floor.spaces.params';

const readOptions = { useJson: true, useStaticData: false, enableRetry: false };
export default class SiteTeamController extends BaseController<ProjectSiteInfoModel> {
  private static instance: SiteTeamController;
  private epoch = 0;
  private quoteId: number | null = null;
  private requests = new Map<string, number>();
  readonly ownerState = shallowRef<DataState<ExecutionQuoteShowModel>>(new DataInitial());
  readonly siteState = shallowRef<DataState<ProjectSiteInfoModel>>(new DataInitial());
  readonly engineersState = shallowRef<DataState<QuoteEngineersModel[]>>(new DataInitial());
  readonly floorsState = shallowRef<DataState<ProjectFloorModel[]>>(new DataInitial());
  readonly employeesState = shallowRef<DataState<EmployeeModel[]>>(new DataInitial());
  readonly spacesState = shallowRef<DataState<SpaceModel[]>>(new DataInitial());
  readonly siteSaveState = shallowRef<DataState<void>>(new DataInitial());
  readonly engineerSaveState = shallowRef<DataState<void>>(new DataInitial());
  readonly spaceSaveState = shallowRef<DataState<void>>(new DataInitial());
  readonly projectId = computed(() => {
    const id = this.ownerState.value.data?.project?.id;
    return positiveId(id) ? id : undefined;
  });
  readonly employeeOptions = {
    fetchAsOptions: (params?: Params) => this.loadEmployees(params),
    isListFailed: () =>
      this.employeesState.value.hasError && !(this.employeesState.value instanceof DataEmpty),
    isListSuccess: () =>
      this.employeesState.value instanceof DataSuccess ||
      this.employeesState.value instanceof DataEmpty,
    pagination: computed(() => this.employeesState.value.pagination),
  };
  readonly spaceOptions = {
    fetchAsOptions: (params?: Params) => this.loadSpaces(params),
    isListFailed: () =>
      this.spacesState.value.hasError && !(this.spacesState.value instanceof DataEmpty),
    isListSuccess: () =>
      this.spacesState.value instanceof DataSuccess || this.spacesState.value instanceof DataEmpty,
    pagination: computed(() => this.spacesState.value.pagination),
  };
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new SiteTeamController());
  }
  protected get repository() {
    return SiteTeamRepository.getInstance();
  }
  protected get config() {
    return { autoRetry: false, showSuccessTosat: true };
  }
  activate(quoteId: number) {
    this.release();
    if (positiveId(quoteId)) this.quoteId = quoteId;
  }
  release() {
    this.epoch++;
    this.quoteId = null;
    this.requests.clear();
    this.ownerState.value = new DataInitial();
    this.siteState.value = new DataInitial();
    this.engineersState.value = new DataInitial();
    this.floorsState.value = new DataInitial();
    this.employeesState.value = new DataInitial();
    this.spacesState.value = new DataInitial();
    this.siteSaveState.value = new DataInitial();
    this.engineerSaveState.value = new DataInitial();
    this.spaceSaveState.value = new DataInitial();
  }
  private requestScope(key: string) {
    const epoch = this.epoch;
    const sequence = (this.requests.get(key) ?? 0) + 1;
    this.requests.set(key, sequence);
    return () => epoch === this.epoch && sequence === this.requests.get(key);
  }
  async load() {
    if (this.quoteId === null) return;
    await Promise.all([this.loadOwner(), this.loadSite(), this.loadEngineers()]);
  }
  async loadOwner() {
    if (this.quoteId === null) return;
    const current = this.requestScope('owner');
    this.ownerState.value = new DataLoading();
    const result = await ExecutionQuoteRepository.getInstance().show(
      new ShowExecutionQuoteParams({ executionQuoteId: this.quoteId }),
      readOptions,
      false,
    );
    if (!current()) return;
    this.ownerState.value = result;
    if (result instanceof DataSuccess) await this.loadFloors();
  }
  async loadSite() {
    if (this.quoteId === null) return;
    const current = this.requestScope('site');
    this.siteState.value = new DataLoading();
    const result = await this.repository.fetchSiteInfo(new QuoteSiteTeamParams(this.quoteId));
    if (current()) this.siteState.value = result;
  }
  async loadEngineers() {
    if (this.quoteId === null) return;
    const current = this.requestScope('engineers');
    this.engineersState.value = new DataLoading();
    const result = await this.repository.fetchEngineers(new QuoteSiteTeamParams(this.quoteId));
    if (current()) this.engineersState.value = result;
  }
  async loadFloors() {
    const projectId = this.projectId.value;
    if (!projectId) return;
    const current = this.requestScope('floors');
    this.floorsState.value = new DataLoading();
    const result = await ProjectFloorRepository.getInstance().index(
      new IndexProjectFloorParams('', 1, 10, 0, undefined, projectId),
      readOptions,
      false,
    );
    if (current()) this.floorsState.value = result;
  }
  async loadEmployees(params?: Params) {
    const epoch = this.epoch;
    const current = this.requestScope('employees');
    this.employeesState.value = new DataLoading();
    const result = await EmployeeRepository.getInstance().index(
      params ?? new IndexEmployeeParams(),
      readOptions,
      false,
    );
    if (current()) this.employeesState.value = result;
    if (epoch !== this.epoch || !(result instanceof DataSuccess)) return [];
    return (result.data ?? [])
      .filter((employee: EmployeeModel) => positiveId(employee.id))
      .map(
        (employee: EmployeeModel) =>
          new TitleInterface({ id: Number(employee.id), title: employee.name }),
      );
  }
  async loadSpaces(params?: Params) {
    const epoch = this.epoch;
    const current = this.requestScope('spaces');
    this.spacesState.value = new DataLoading();
    const result = await SpaceRepository.getInstance().index(
      params ?? new IndexSpaceParams(),
      readOptions,
      false,
    );
    if (current()) this.spacesState.value = result;
    if (epoch !== this.epoch || !(result instanceof DataSuccess)) return [];
    return (result.data ?? [])
      .filter((space: SpaceModel) => positiveId(space.id))
      .map(
        (space: SpaceModel) =>
          new TitleInterface({ id: Number(space.id), title: space.title ?? String(space.id) }),
      );
  }
  async saveSite(params: UpdateProjectSiteInfoParams) {
    if (params.quoteId !== this.quoteId || this.siteSaveState.value instanceof DataLoading)
      return new DataCancelled<void>();
    const current = this.requestScope('siteSave');
    this.siteSaveState.value = new DataLoading();
    const result = await this.repository.updateSiteInfo(params);
    if (!current()) return new DataCancelled<void>();
    if (result instanceof DataSuccess) {
      await this.loadSite();
      if (current()) this.showSuccessToast('site_team.saved');
    }
    if (!current()) return new DataCancelled<void>();
    this.siteSaveState.value = result;
    return result;
  }
  async saveEngineers(params: AssignQuoteEngineersParams) {
    // console.log('saveEngineers', params.quoteId, this.quoteId, this.engineerSaveState.value);

    const current = this.requestScope('engineerSave');
    this.engineerSaveState.value = new DataLoading();
    const result = await this.repository.assignEngineers(params);
    if (!current()) return new DataCancelled<void>();
    if (result instanceof DataSuccess) {
      await this.loadEngineers();
      if (current()) this.showSuccessToast('site_team.saved');
    }
    if (!current()) return new DataCancelled<void>();
    this.engineerSaveState.value = result;
    return result;
  }
  async saveSpaces(params: AddProjectFloorSpacesParams) {
    if (
      this.spaceSaveState.value instanceof DataLoading ||
      !this.floorsState.value.data?.some((floor) => floor.id === params.projectFloorId)
    )
      return new DataCancelled<void>();
    const current = this.requestScope('spaceSave');
    this.spaceSaveState.value = new DataLoading();
    const result = await ProjectFloorController.getInstance().addSpaces(params);
    if (!current()) return new DataCancelled<void>();
    if (result instanceof DataSuccess) {
      await this.loadFloors();
      if (current()) this.showSuccessToast('site_team.saved');
    }
    if (!current()) return new DataCancelled<void>();
    this.spaceSaveState.value = result;
    return result;
  }
}
