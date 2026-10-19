import { validId } from '../constants/schedule.constants';
import { isWorkStatus, type TimelineWorkStatus } from '../constants/timeline.status';
import { responseObject } from './schedule.response';

export default class ProjectTimelineWorkStatusModel {
  public readonly projectTimelineId: number;
  public readonly quoteId: number;
  public readonly workStatus: TimelineWorkStatus;
  constructor(projectTimelineId: number, quoteId: number, workStatus: TimelineWorkStatus) {
    this.projectTimelineId = projectTimelineId;
    this.quoteId = quoteId;
    this.workStatus = workStatus;
  }
  static fromJson(value: unknown) {
    const data = responseObject(value);
    if (
      !validId(Number(data.project_timeline_id)) ||
      !validId(Number(data.quote_id)) ||
      !isWorkStatus(data.work_status)
    )
      throw new Error('schedule.invalid_response');
    return new ProjectTimelineWorkStatusModel(
      Number(data.project_timeline_id),
      Number(data.quote_id),
      data.work_status,
    );
  }
}
