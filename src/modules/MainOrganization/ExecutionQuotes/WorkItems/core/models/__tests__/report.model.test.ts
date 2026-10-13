import { expect, it } from 'vitest';
import DailyReportModel from '../report.model';
it('maps report date, null notes, safety and creator', () => {
  const report = DailyReportModel.fromJson({
    id: 1,
    project_timeline_stage_id: 18,
    employee: { id: 1, name: 'Creator', type: 1 },
    date: '2026-10-12',
    notes: null,
    site_safety_status: 2,
    created_at: null,
  });
  expect(report.date).toBe('2026-10-12');
  expect(report.notes).toBeNull();
  expect(report.siteSafetyStatus).toBe(2);
  expect(report.employee.name).toBe('Creator');
});
it('rejects unsupported safety', () =>
  expect(() => DailyReportModel.fromJson({ site_safety_status: 9 })).toThrow());
