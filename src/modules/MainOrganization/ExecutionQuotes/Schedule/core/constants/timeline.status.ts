export const TimelineApprovalStatus = { PENDING: 1, CANCEL: 2, APPROVED: 3 } as const;
export type TimelineApprovalStatus =
  (typeof TimelineApprovalStatus)[keyof typeof TimelineApprovalStatus];
export const TimelineWorkStatus = { START: 1, HOLD: 2, STOP: 3 } as const;
export type TimelineWorkStatus = (typeof TimelineWorkStatus)[keyof typeof TimelineWorkStatus];
export const TimelineWorkReason = { CLIENT: 1, COMPANY: 2 } as const;
export type TimelineWorkReason = (typeof TimelineWorkReason)[keyof typeof TimelineWorkReason];

export const isApprovalStatus = (value: unknown): value is TimelineApprovalStatus =>
  typeof value === 'number' &&
  Object.values(TimelineApprovalStatus).includes(value as TimelineApprovalStatus);
export const isWorkStatus = (value: unknown): value is TimelineWorkStatus =>
  typeof value === 'number' &&
  Object.values(TimelineWorkStatus).includes(value as TimelineWorkStatus);
export const isWorkReason = (value: unknown): value is TimelineWorkReason =>
  typeof value === 'number' &&
  Object.values(TimelineWorkReason).includes(value as TimelineWorkReason);
