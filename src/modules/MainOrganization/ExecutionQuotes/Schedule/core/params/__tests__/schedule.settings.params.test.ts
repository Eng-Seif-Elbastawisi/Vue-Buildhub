import { expect, it } from 'vitest';
import ScheduleSettingsParams from '../schedule.settings.params';
it.each([[], [1], [2], [3], [4], [5], [6], [7], [5, 6], [1, 7]].map((days) => [days]))(
  'accepts zero to two days off and sends no working_days: %j',
  (days) => {
    const params = new ScheduleSettingsParams(101, '2026-10-09', days);
    expect(params.validate().isValid).toBe(true);
    expect(params.toMap()).toEqual({
      quote_id: 101,
      start_date: '2026-10-09',
      holidays: days,
    });
  },
);
it.each([[1, 2, 3], [5, 5], [7, 7], [-1], [0], [8], [1.5]].map((days) => [days]))(
  'rejects invalid days off without truncating: %j',
  (days) => {
    const params = new ScheduleSettingsParams(101, '2026-10-09', days);
    expect(params.validate().isValid).toBe(false);
    expect(params.toMap().holidays).toEqual(days);
  },
);
it.each(['', '2026-02-29', '2026-13-01', '2026-1-01', '2026-10-09T00:00:00Z'])(
  'rejects a non-date-only or impossible date: %s',
  (date) => {
    expect(new ScheduleSettingsParams(101, date, []).validate().isValid).toBe(false);
  },
);
it('retains the entered planned start even on a selected day off', () => {
  const params = new ScheduleSettingsParams(101, '2024-02-29', [4]);
  expect(params.validate().isValid).toBe(true);
  expect(params.toMap().start_date).toBe('2024-02-29');
});
