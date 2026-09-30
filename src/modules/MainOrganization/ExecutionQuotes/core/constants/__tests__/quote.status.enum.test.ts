import { describe, expect, it } from 'vitest';

import {
  QuoteStatusEnum,
  canChangeQuoteStatus,
  getAllowedQuoteStatusTransitions,
  getQuoteStatusTransitionPath,
} from '../quote.status.enum';

describe('quote status transitions', () => {
  it.each([
    [QuoteStatusEnum.DRAFT, [QuoteStatusEnum.PENDING_VALIDATION]],
    [
      QuoteStatusEnum.PENDING_VALIDATION,
      [QuoteStatusEnum.REVISION_REQUIRED, QuoteStatusEnum.SENT_TO_CLIENT],
    ],
    [
      QuoteStatusEnum.REVISION_REQUIRED,
      [QuoteStatusEnum.PENDING_VALIDATION, QuoteStatusEnum.SENT_TO_CLIENT],
    ],
    [QuoteStatusEnum.SENT_TO_CLIENT, []],
  ])('returns the allowed next statuses for %s', (currentStatus, expectedStatuses) => {
    expect(getAllowedQuoteStatusTransitions(currentStatus)).toEqual(expectedStatuses);
  });

  it('rejects status changes outside the workflow', () => {
    expect(canChangeQuoteStatus(QuoteStatusEnum.DRAFT, QuoteStatusEnum.PENDING_VALIDATION)).toBe(
      true,
    );
    expect(canChangeQuoteStatus(QuoteStatusEnum.DRAFT, QuoteStatusEnum.SENT_TO_CLIENT)).toBe(false);
    expect(
      canChangeQuoteStatus(QuoteStatusEnum.REVISION_REQUIRED, QuoteStatusEnum.SENT_TO_CLIENT),
    ).toBe(true);
    expect(canChangeQuoteStatus(undefined, QuoteStatusEnum.PENDING_VALIDATION)).toBe(false);
  });

  it('routes revision-to-client through pending validation for the backend workflow', () => {
    expect(
      getQuoteStatusTransitionPath(
        QuoteStatusEnum.REVISION_REQUIRED,
        QuoteStatusEnum.SENT_TO_CLIENT,
      ),
    ).toEqual([QuoteStatusEnum.PENDING_VALIDATION, QuoteStatusEnum.SENT_TO_CLIENT]);
    expect(
      getQuoteStatusTransitionPath(QuoteStatusEnum.DRAFT, QuoteStatusEnum.PENDING_VALIDATION),
    ).toEqual([QuoteStatusEnum.PENDING_VALIDATION]);
  });
});
