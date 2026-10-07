import BaseRepository from '@/base/Domain/Repositories/baseRepository';
import ScheduleOwnerParams from '../../core/params/schedule.owner.params';
import type Params from '@/base/Core/Params/params';
import {
  DataFailed,
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import ScheduleGroupModel from '../../core/models/schedule.group.model';
import { responseObject } from '../../core/models/schedule.response';
import ProjectTimelineOverviewModel from '../../core/models/project.timeline.overview.model';
import type ChangeProjectTimelineOrderParams from '../../core/params/change.project.timeline.order.params';
import type ScheduleSettingsModel from '../../core/models/schedule.settings.model';
import ScheduleApiService from '../api/schedule.api-service';
import { scheduleContractError } from '../../core/constants/schedule.constants';
import { scheduleContractGaps, type ScheduleOperation } from '../api/schedule.contract';

export default class ScheduleRepository extends BaseRepository<ScheduleGroupModel> {
  private static instance: ScheduleRepository;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new ScheduleRepository());
  }
  protected get apiService() {
    return ScheduleApiService.getInstance();
  }
  protected parseItem(response: unknown): ScheduleGroupModel {
    return ScheduleGroupModel.fromJson(response);
  }
  protected parseList(response: unknown): ScheduleGroupModel[] {
    return ProjectTimelineOverviewModel.fromJson(response).projectTimelines;
  }
  // Block before transport: an unparseable successful mutation must never encourage duplicate submissions.
  private blocked<T>(operation: ScheduleOperation): Promise<DataState<T>> {
    return Promise.resolve(
      new DataFailed<T>({
        error: new ErrorModel(scheduleContractError, ErrorType.serviceSide, {
          details: `${operation}: ${scheduleContractGaps[operation].join(', ')}`,
        }),
      }),
    );
  }
  async index(params?: Params): Promise<DataState<ScheduleGroupModel[]>> {
    if (!params) return this.blocked('index');
    const state = await this.readOverview(params);
    return state instanceof DataSuccess && state.data
      ? new DataSuccess({ data: state.data.projectTimelines })
      : new DataFailed({ error: state.error });
  }
  async show(params?: Params): Promise<DataState<ScheduleGroupModel>> {
    try {
      const response = await this.apiService.show(params);
      if (response.statusCode !== 200)
        return new DataFailed({
          error: new ErrorModel('schedule.load_error', ErrorType.dataDirty),
        });
      return new DataSuccess({ data: this.parseItem(response.data) });
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }
  async readOverview(params: Params): Promise<DataState<ProjectTimelineOverviewModel>> {
    try {
      const response = await this.apiService.index(params);
      // Accept only the supplied body shape. Do not guess a nested data/result envelope.
      if (response.statusCode !== 200)
        return new DataFailed({
          error: new ErrorModel('schedule.load_error', ErrorType.dataDirty),
        });
      const envelope = responseObject(response.data);
      if (envelope.status !== true)
        return new DataFailed({
          error: new ErrorModel('schedule.load_error', ErrorType.dataDirty),
        });
      return new DataSuccess({ data: ProjectTimelineOverviewModel.fromJson(envelope.data) });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'schedule.invalid_response')
        return new DataFailed({
          error: new ErrorModel('schedule.invalid_response', ErrorType.dataDirty),
        });
      return this.handleError(error);
    }
  }
  async create(_params: Params): Promise<DataState<ScheduleGroupModel>> {
    return this.blocked('create');
  }
  async update(_params?: Params): Promise<DataState<ScheduleGroupModel>> {
    return this.blocked('update');
  }
  async delete(_params?: Params): Promise<DataState<void>> {
    return this.blocked('delete');
  }
  async readSettings(params: Params): Promise<DataState<ScheduleSettingsModel>> {
    try {
      if (!(params instanceof ScheduleOwnerParams)) return this.blocked('settings');
      await this.apiService.settings(params);
      return this.blocked('settings');
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }
  async saveSettings(_params: Params): Promise<DataState<void>> {
    return this.blocked('saveSettings');
  }
  async changeProjectTimelineOrder(
    _params: ChangeProjectTimelineOrderParams,
  ): Promise<DataState<void>> {
    return this.blocked('sort');
  }
}
