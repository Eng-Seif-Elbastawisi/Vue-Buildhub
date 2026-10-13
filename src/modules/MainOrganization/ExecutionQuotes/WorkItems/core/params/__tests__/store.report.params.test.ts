import { expect, it } from 'vitest';
import StoreReportParams from '../store.report.params';
it.each([1, 2, 3])('sends documented safety status %i and nullable notes', (status) => {
  const report = new StoreReportParams(18, '2026-10-12', null, status);
  expect(report.validate().isValid).toBe(true);
  expect(report.toMap()).toEqual({
    project_timeline_stage_id: 18,
    date: '2026-10-12',
    notes: null,
    site_safety_status: status,
  });
});
it('rejects unsupported safety and invalid date', () => {
  expect(new StoreReportParams(18, '2026-02-30', null, 1).validate().isValid).toBe(false);
  expect(new StoreReportParams(18, '2026-10-12', null, 9).validate().isValid).toBe(false);
});
