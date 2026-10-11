import { responseObject } from './schedule.response';
export default class ProjectTimelineBasicDataModel {
  public readonly startDate: string | null | undefined;
  public readonly endDate: string | null | undefined;
  public readonly status: string | number | null | undefined;
  public readonly count: number;
  constructor(
    startDate: string | null | undefined,
    endDate: string | null | undefined,
    status: string | number | null | undefined,
    count: number,
  ) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.count = count;
  }
  static fromJson(value: unknown): ProjectTimelineBasicDataModel {
    const payload = responseObject(value);
    if (
      typeof payload.count_timeline !== 'number' ||
      !Number.isSafeInteger(payload.count_timeline) ||
      payload.count_timeline < 0 ||
      (payload.start_date !== undefined &&
        payload.start_date !== null &&
        typeof payload.start_date !== 'string') ||
      (payload.end_date !== undefined &&
        payload.end_date !== null &&
        typeof payload.end_date !== 'string') ||
      (payload.status !== undefined &&
        payload.status !== null &&
        typeof payload.status !== 'string' &&
        typeof payload.status !== 'number')
    )
      throw new Error('schedule.invalid_response');
    return new ProjectTimelineBasicDataModel(
      payload.start_date,
      payload.end_date,
      payload.status,
      payload.count_timeline,
    );
  }
}
