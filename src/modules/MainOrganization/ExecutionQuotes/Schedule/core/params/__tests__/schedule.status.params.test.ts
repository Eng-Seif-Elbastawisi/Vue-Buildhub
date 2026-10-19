import { expect, it } from 'vitest';
import {
  ChangeTimelineApprovalParams,
  ChangeTimelineWorkStatusParams,
} from '../schedule.status.params';

it('serializes Quote approval without sending the server-managed approver', () => {
  expect(new ChangeTimelineApprovalParams(140, 3, 'Approved').toMap()).toEqual({
    quote_id: 140,
    timeline_status: 3,
    timeline_note: 'Approved',
  });
  expect(new ChangeTimelineApprovalParams(140, 1).toMap()).toEqual({
    quote_id: 140,
    timeline_status: 1,
  });
});
it('serializes Reject using the existing CANCEL approval status', () => {
  expect(new ChangeTimelineApprovalParams(140, 2, 'Needs revision').toMap()).toEqual({
    quote_id: 140,
    timeline_status: 2,
    timeline_note: 'Needs revision',
  });
});
it('serializes only one Group work transition and preserves omitted or null optional fields', () => {
  expect(new ChangeTimelineWorkStatusParams(2, 2, 1, 'Paused').toMap()).toEqual({
    project_timeline_id: 2,
    work_status: 2,
    reason: 1,
    note: 'Paused',
  });
  expect(new ChangeTimelineWorkStatusParams(2, 1, null, null).toMap()).toEqual({
    project_timeline_id: 2,
    work_status: 1,
    reason: null,
    note: null,
  });
  expect(new ChangeTimelineWorkStatusParams(2, 3).toMap()).toEqual({
    project_timeline_id: 2,
    work_status: 3,
  });
});
