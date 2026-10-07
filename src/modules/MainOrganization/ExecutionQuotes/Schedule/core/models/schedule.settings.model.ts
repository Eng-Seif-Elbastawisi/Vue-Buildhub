// Missing settings are represented by null state data, distinct from holidays: [].
export default class ScheduleSettingsModel {
  public readonly startDate: string | null | undefined;
  public readonly holidays: number[];
  constructor(startDate: string | null | undefined, holidays: number[]) {
    this.startDate = startDate;
    this.holidays = holidays;
  }
}
