import BaseRepository from '@/base/Domain/Repositories/baseRepository';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
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
import type ScheduleSettingsParams from '../../core/params/schedule.settings.params';
import ScheduleApiService from '../api/schedule.api-service';
import { scheduleContractError } from '../../core/constants/schedule.constants';

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
  index(params?: Params, options?: ApiCallOptions) {
    return super.index(params, { ...options, useStaticData: false }, false);
  }
  async show(params?: Params): Promise<DataState<ScheduleGroupModel>> {
    try {
      const response = await this.apiService.show(params);
      if (response.statusCode !== 200)
        return new DataFailed({
          error: new ErrorModel('schedule.load_error', ErrorType.dataDirty),
        });
      // console.log('response.data', response.data);
      return new DataSuccess({ data: this.parseItem(response.data?.data as unknown) });
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
  create(params: Params, options?: ApiCallOptions) {
    return super.create(params, { ...options, useStaticData: false }, false);
  }
  update(params?: Params, options?: ApiCallOptions) {
    return super.update(params, { ...options, useStaticData: false }, false);
  }
  delete(params?: Params, options?: ApiCallOptions) {
    return super.delete(params, { ...options, useStaticData: false });
  }
  async readSettings(params: Params): Promise<DataState<ScheduleSettingsModel>> {
    try {
      if (!(params instanceof ScheduleOwnerParams))
        return new DataFailed({
          error: new ErrorModel('schedule.invalid_form', ErrorType.validation),
        });
      await this.apiService.settings(params);
      // The Configuration response example is still missing; do not fabricate saved settings.
      return new DataFailed({
        error: new ErrorModel(scheduleContractError, ErrorType.serviceSide, {
          details: 'configuration_envelope_schema, missing_configuration',
        }),
      });
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }
  async saveSettings(params: ScheduleSettingsParams): Promise<DataState<void>> {
    try {
      return this.processVoidResponse(await this.apiService.saveSettings(params));
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }
  async changeProjectTimelineOrder(
    params: ChangeProjectTimelineOrderParams,
  ): Promise<DataState<void>> {
    try {
      return this.processVoidResponse(await this.apiService.sort(params));
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }
}
