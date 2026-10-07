import { expect, it } from 'vitest';
import ScheduleSettingsModel from '../schedule.settings.model';
it('retains missing, null and date-only planned starts separately from no days off', () => {
  for (const start of [undefined, null, '2026-10-09']) {
    const settings = new ScheduleSettingsModel(start, []);
    expect(settings.startDate).toBe(start);
    expect(settings.holidays).toEqual([]);
  }
});
