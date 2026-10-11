import { weekdays } from '../constants/schedule.constants';
import { responseObject } from './schedule.response';

// Missing settings are represented by null state data, distinct from holidays: [].
export default class ScheduleSettingsModel {
  public readonly startDate: string | null | undefined;
  public readonly holidays: number[];
  constructor(startDate: string | null | undefined, holidays: number[]) {
    this.startDate = startDate;
    this.holidays = holidays;
  }
  static fromJson(response: unknown): ScheduleSettingsModel {
    const configuration = responseObject(response);
    if (
      typeof configuration.start_date !== 'string' ||
      !Array.isArray(configuration.holidays) ||
      !configuration.holidays.every(
        (day: unknown) => typeof day === 'number' && weekdays.some((weekday) => weekday === day),
      )
    )
      throw new Error('schedule.invalid_response');
    return new ScheduleSettingsModel(configuration.start_date, [...configuration.holidays]);
  }
}
