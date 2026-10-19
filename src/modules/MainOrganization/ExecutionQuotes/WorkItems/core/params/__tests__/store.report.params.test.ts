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
    report_scope_type: 1,
    attachments: [],
  });
});
it('rejects unsupported safety and invalid date', () => {
  expect(new StoreReportParams(18, '2026-02-30', null, 1).validate().isValid).toBe(false);
  expect(new StoreReportParams(18, '2026-10-12', null, 9).validate().isValid).toBe(false);
});

import ReportAttachmentParams from '../report.attachment.params';
it('specific-space reports require the association and serialize attachment subparams', () => {
  const report = new StoreReportParams(18, '2026-10-12', 'Notes', 1, 2, 171, [
    new ReportAttachmentParams('data:image/jpeg;base64,YQ=='),
  ]);
  expect(report.validate().isValid).toBe(true);
  expect(report.toMap()).toMatchObject({
    report_scope_type: 2,
    project_floor_space_id: 171,
    attachments: [{ file: 'data:image/jpeg;base64,YQ==' }],
  });
  report.projectFloorSpaceId = null;
  expect(report.validate().isValid).toBe(false);
});
it('project-wide reports omit a stale space association and support no attachments', () => {
  const report = new StoreReportParams(18, '2026-10-12', null, 1, 1, 171);
  expect(report.toMap()).not.toHaveProperty('project_floor_space_id');
  expect(report.toMap()).toMatchObject({ report_scope_type: 1, attachments: [] });
});
