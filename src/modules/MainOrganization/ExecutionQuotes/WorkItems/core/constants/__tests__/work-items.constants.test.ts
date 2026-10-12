import { expect, it } from 'vitest';
import { dateOnly, positiveId, SiteSafetyStatus, WorkActivityType } from '../work-items.constants';
it.each(['2026-10-12', '2024-02-29'])('accepts date-only calendar value %s', (date) =>
  expect(dateOnly(date)).toBe(true),
);
it.each(['2026-02-29', '2026-04-31', '2026-00-10', '2026-10-00', '2026-10-12T00:00:00Z'])(
  'rejects invalid calendar value %s',
  (date) => expect(dateOnly(date)).toBe(false),
);
it('validates IDs and documented enums', () => {
  expect([0, -1, NaN, 1.1, '18'].some(positiveId)).toBe(false);
  expect(positiveId(18)).toBe(true);
  expect(SiteSafetyStatus.Incident).toBe(3);
  expect(WorkActivityType.Delay).toBe(4);
});
