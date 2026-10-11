import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import ScheduleOwnerParams from './schedule.owner.params';
import { weekdays } from '../constants/schedule.constants';

export function validDateOnly(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}
export default class ScheduleSettingsParams extends ScheduleOwnerParams {
  static readonly settingsValidation = new ClassValidation().setRules({
    startDate: { required: true, custom: validDateOnly },
    holidays: {
      custom: (days: number[]) =>
        days.length <= 2 &&
        new Set(days).size === days.length &&
        days.every((day) => weekdays.some((weekday) => weekday === day)),
    },
  });
  public startDate: string;
  public holidays: number[];
  constructor(quoteId: number, startDate: string, holidays: number[]) {
    super(quoteId);
    this.startDate = startDate;
    this.holidays = holidays;
  }
  toMap() {
    return {
      quote_id: this.quoteId,
      start_date: this.startDate,
      holidays: [...this.holidays],
    };
  }
  validate() {
    const errors = [
      ...super.validate().errors,
      ...ScheduleSettingsParams.settingsValidation.validate(this).errors,
    ];
    return { isValid: errors.length === 0, errors };
  }
  validateOrThrow() {
    super.validateOrThrow();
    ScheduleSettingsParams.settingsValidation.validateOrThrow(this);
  }
}
