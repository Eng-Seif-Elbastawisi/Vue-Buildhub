import { expect, it } from 'vitest';
import ScheduleSettingsModel from '../schedule.settings.model';
it('retains missing, null and date-only planned starts separately from no days off', () => {
  for (const start of [undefined, null, '2026-10-09']) {
    const settings = new ScheduleSettingsModel(start, []);
    expect(settings.startDate).toBe(start);
    expect(settings.holidays).toEqual([]);
  }
});

it.each([{ holidays: [] }, { holidays: [4] }, { holidays: [1, 7] }])(
  'maps saved configuration with holidays $holidays',
  ({ holidays }) => {
    const settings = ScheduleSettingsModel.fromJson({
      id: 1,
      start_date: '2026-10-29',
      holidays,
      created_at: '2026-10-11 08:17:42',
    });
    expect(settings.startDate).toBe('2026-10-29');
    expect(settings.holidays).toEqual(holidays);
  },
);
it.each([
  null,
  {},
  { start_date: '2026-10-29' },
  { start_date: '2026-10-29', holidays: ['4'] },
  { start_date: '2026-10-29', holidays: [8] },
])('rejects malformed configuration %j without defaulting saved fields', (configuration) => {
  expect(() => ScheduleSettingsModel.fromJson(configuration)).toThrow('schedule.invalid_response');
});
