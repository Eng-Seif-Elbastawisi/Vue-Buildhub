import { expect, it } from 'vitest';
import DailyReportModel from '../report.model';
import WorkActivityModel from '../activity.model';
import ShopDrawingQuoteModel from '../shop-drawing.model';
import PurchaseRequestProjectFloorSpaceModel from '../../../../Procurement/core/models/purchase-request.project-floor-space.model';
import ExecutionQuoteAttachmentModel from '../../../../core/models/execution.quote.attachment.model';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
const employee = { id: 1, name: 'Creator', type: 1 };
const space = {
  id: 171,
  space: { id: 9, title: 'Living room' },
  length: '5.00',
  width: '4.00',
  height: '2.00',
  notes: null,
  attachments: [{ id: 99, file: 'https://example.test/space.jpg' }],
};
it('maps report attachments separately from the associated space', () => {
  const report = DailyReportModel.fromJson({
    id: 5,
    project_timeline_stage_id: 18,
    employee,
    date: '2026-10-12',
    notes: null,
    site_safety_status: 1,
    report_scope_type: 2,
    project_floor_space_id: 171,
    project_floor_space: space,
    attachments: [
      {
        id: 1,
        file: 'https://example.test/report.jpg',
        file_size: '22.86 KB',
        type: 1,
        alt: null,
        link: null,
        created_at: '2026-10-19',
      },
    ],
  });
  expect(report.projectFloorSpace).toBeInstanceOf(PurchaseRequestProjectFloorSpaceModel);
  expect(report.projectFloorSpace?.id).toBe(171);
  expect(report.projectFloorSpace?.space.id).toBe(9);
  expect(report.projectFloorSpace?.attachments[0]?.id).toBe(99);
  expect(report.attachments).toHaveLength(1);
  expect(report.attachments[0]).toBeInstanceOf(ExecutionQuoteAttachmentModel);
  expect(report.attachments[0]?.file).toBe('https://example.test/report.jpg');
  expect(report.attachments[0]?.type).toBe(1);
});
it.each([null, space])('reads new and legacy Shop Drawing space relations: %s', (association) => {
  const drawing = ShopDrawingQuoteModel.fromJson({
    id: 3,
    quote_id: 140,
    employee,
    title: 'MEP',
    version_number: 'V1',
    file: null,
    custom_number: 3,
    stages: [],
    project_floor_space_id: association?.id ?? null,
    project_floor_space: association,
  });
  expect(drawing.projectFloorSpace?.space.title ?? null).toBe(association?.space.title ?? null);
  expect(drawing.customNumber).toBe(3);
});
it.each([null, 1, 2])(
  'maps audience %s independently of record type and creator/assignee',
  (audience) => {
    const meeting = WorkActivityModel.fromJson({
      id: 3,
      project_timeline_stage_id: 18,
      employee,
      assigned_employee: { id: 6, name: 'Assigned', type: 2 },
      title: 'Weekly',
      type: 1,
      description: null,
      meeting_audience_type: audience,
      result: audience == null ? null : 'Agreed',
      attendees: audience == null ? [] : [{ id: 7, name: 'Attendee', type: 3 }],
    });
    expect(meeting.meetingAudienceType).toBe(audience);
    expect(meeting.employee.id).toBe(1);
    expect(meeting.assignedEmployee?.id).toBe(6);
    expect(meeting.attendees.map((attendee) => attendee.id)).toEqual(audience == null ? [] : [7]);
    if (audience != null) expect(meeting.attendees[0]).toBeInstanceOf(EmployeeModel);
    expect(meeting.description).toBeNull();
  },
);
