import ScheduleGroupModel from './schedule.group.model';
import ProjectTimelineBasicDataModel from './project.timeline.basic-data.model';
import { responseObject } from './schedule.response';
export default class ProjectTimelineOverviewModel {
  public readonly basicData: ProjectTimelineBasicDataModel;
  public readonly projectTimelines: ScheduleGroupModel[];
  constructor(basicData: ProjectTimelineBasicDataModel, projectTimelines: ScheduleGroupModel[]) {
    this.basicData = basicData;
    this.projectTimelines = projectTimelines;
  }
  get startDate() {
    return this.basicData.startDate;
  }
  get endDate() {
    return this.basicData.endDate;
  }
  get status() {
    return this.basicData.status;
  }
  get count() {
    return this.basicData.count;
  }
  static fromJson(value: unknown): ProjectTimelineOverviewModel {
    const payload = responseObject(value);
    if (!Array.isArray(payload.data)) throw new Error('schedule.invalid_response');
    return new ProjectTimelineOverviewModel(
      ProjectTimelineBasicDataModel.fromJson(payload.basicData),
      payload.data.map((timeline: unknown) => ScheduleGroupModel.fromJson(timeline)),
    );
  }
}
