import { expect, it } from 'vitest';
import {
  TimelineApprovalStatus,
  TimelineWorkStatus,
  TimelineWorkReason,
  isApprovalStatus,
  isWorkStatus,
  isWorkReason,
} from '../timeline.status';
it('keeps approval, work, and reason values distinct', () => {
  expect(TimelineApprovalStatus).toEqual({ PENDING: 1, CANCEL: 2, APPROVED: 3 });
  expect(TimelineWorkStatus).toEqual({ START: 1, HOLD: 2, STOP: 3 });
  expect(TimelineWorkReason).toEqual({ CLIENT: 1, COMPANY: 2 });
  expect(isApprovalStatus(3)).toBe(true);
  expect(isWorkStatus(null)).toBe(false);
  expect(isWorkReason(3)).toBe(false);
});
