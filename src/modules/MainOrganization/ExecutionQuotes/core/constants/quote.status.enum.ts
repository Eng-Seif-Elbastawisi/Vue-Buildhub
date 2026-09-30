export const QuoteStatusEnum = {
  DRAFT: 1,
  PENDING_VALIDATION: 2,
  REVISION_REQUIRED: 3,
  SENT_TO_CLIENT: 4,
} as const;

export type QuoteStatusEnum = (typeof QuoteStatusEnum)[keyof typeof QuoteStatusEnum];

export const getAllowedQuoteStatusTransitions = (
  status?: QuoteStatusEnum | number | null,
): QuoteStatusEnum[] => {
  switch (status) {
    case QuoteStatusEnum.DRAFT:
      return [QuoteStatusEnum.PENDING_VALIDATION];
    case QuoteStatusEnum.PENDING_VALIDATION:
      return [QuoteStatusEnum.REVISION_REQUIRED, QuoteStatusEnum.SENT_TO_CLIENT];
    case QuoteStatusEnum.REVISION_REQUIRED:
      return [QuoteStatusEnum.PENDING_VALIDATION, QuoteStatusEnum.SENT_TO_CLIENT];
    default:
      return [];
  }
};

export const canChangeQuoteStatus = (
  currentStatus?: QuoteStatusEnum | number | null,
  nextStatus?: QuoteStatusEnum | number | null,
): boolean =>
  nextStatus !== undefined &&
  nextStatus !== null &&
  getAllowedQuoteStatusTransitions(currentStatus).includes(nextStatus as QuoteStatusEnum);

export const getQuoteStatusTransitionPath = (
  currentStatus?: QuoteStatusEnum | number | null,
  nextStatus?: QuoteStatusEnum | null,
): QuoteStatusEnum[] => {
  if (nextStatus == null || !canChangeQuoteStatus(currentStatus, nextStatus)) return [];

  return currentStatus === QuoteStatusEnum.REVISION_REQUIRED &&
    nextStatus === QuoteStatusEnum.SENT_TO_CLIENT
    ? [QuoteStatusEnum.PENDING_VALIDATION, QuoteStatusEnum.SENT_TO_CLIENT]
    : [nextStatus];
};

export const getQuoteStatusNameKey = (status?: QuoteStatusEnum | number | null): string => {
  switch (status) {
    case QuoteStatusEnum.DRAFT:
      return 'quote_status.draft';
    case QuoteStatusEnum.PENDING_VALIDATION:
      return 'quote_status.pending_validation';
    case QuoteStatusEnum.REVISION_REQUIRED:
      return 'quote_status.revision_required';
    case QuoteStatusEnum.SENT_TO_CLIENT:
      return 'quote_status.sent_to_client';
    default:
      return 'quote_status.unknown';
  }
};

export const getQuoteStatusBadgeClass = (status?: QuoteStatusEnum | number | null): string => {
  switch (status) {
    case QuoteStatusEnum.DRAFT:
      return 'status-draft';
    case QuoteStatusEnum.PENDING_VALIDATION:
      return 'status-pending-validation';
    case QuoteStatusEnum.REVISION_REQUIRED:
      return 'status-revision-required';
    case QuoteStatusEnum.SENT_TO_CLIENT:
      return 'status-sent-to-client';
    default:
      return 'status-default';
  }
};
