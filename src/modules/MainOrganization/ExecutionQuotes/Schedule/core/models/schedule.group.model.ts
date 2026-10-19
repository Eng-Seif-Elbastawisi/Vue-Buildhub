import { isDurationType, validId } from '../constants/schedule.constants';
import type TitleModel from '@/base/Core/Models/titleModel';
import ProjectTimelineStageModel from './project.timeline.stage.model';
import { mappedLabel } from './project.timeline.sub-stage.model';
import { responseObject } from './schedule.response';
import type { TaskDurationType } from '../constants/schedule.constants';
import { isWorkStatus, type TimelineWorkStatus } from '../constants/timeline.status';
export default class ScheduleGroupModel {
  public readonly id: number;
  public readonly title: string;
  public readonly stages: ProjectTimelineStageModel[];
  public readonly duration: number;
  public readonly durationType: TaskDurationType;
  public readonly startDate?: string | null;
  public readonly employee?: TitleModel | null;
  public readonly createdAt?: string | null;
  public readonly selectionsAvailable: boolean;
  public readonly finishDate?: string | null;
  public readonly workStatus?: TimelineWorkStatus | null;
  constructor(group: {
    id: number;
    title: string;
    stages: ProjectTimelineStageModel[];
    employee?: TitleModel | null;
    createdAt?: string | null;
    selectionsAvailable?: boolean;
    duration: number;
    durationType: TaskDurationType;
    startDate?: string | null;
    finishDate?: string | null;
    workStatus?: TimelineWorkStatus | null;
  }) {
    this.id = group.id;
    this.title = group.title;
    this.stages = group.stages;
    this.selectionsAvailable = group.selectionsAvailable === true;
    this.employee = group.employee;
    this.createdAt = group.createdAt;
    this.duration = group.duration;
    this.durationType = group.durationType;
    this.startDate = group.startDate;
    this.finishDate = group.finishDate;
    this.workStatus = group.workStatus;
  }
  static fromJson(value: unknown): ScheduleGroupModel {
    const payload = responseObject(value);
    if (
      typeof payload.id !== 'number' ||
      !validId(payload.id) ||
      typeof payload.title !== 'string' ||
      !payload.title.trim() ||
      typeof payload.duration !== 'number' ||
      !Number.isFinite(payload.duration) ||
      payload.duration <= 0 ||
      !isDurationType(payload.duration_type) ||
      !Array.isArray(payload.stages) ||
      (payload.created_at !== undefined &&
        payload.created_at !== null &&
        typeof payload.created_at !== 'string') ||
      (payload.start_date !== undefined &&
        payload.start_date !== null &&
        typeof payload.start_date !== 'string') ||
      (payload.finish_date !== undefined &&
        payload.finish_date !== null &&
        typeof payload.finish_date !== 'string') ||
      (payload.work_status !== undefined &&
        payload.work_status !== null &&
        !isWorkStatus(payload.work_status))
    )
      throw new Error('schedule.invalid_response');
    return new ScheduleGroupModel({
      id: payload.id,
      title: payload.title,
      duration: payload.duration,
      durationType: payload.duration_type,
      employee: mappedLabel(payload.employee),
      createdAt: payload.created_at,
      stages: payload.stages.map((stage: unknown) => ProjectTimelineStageModel.fromJson(stage)),
      selectionsAvailable: true,
      startDate: payload.start_date ?? undefined,
      finishDate: payload.finish_date ?? undefined,
      workStatus:
        payload.work_status === null
          ? null
          : (payload.work_status as TimelineWorkStatus | undefined),
    });
  }
}
