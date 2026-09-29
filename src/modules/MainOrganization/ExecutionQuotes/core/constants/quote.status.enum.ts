export const QuoteStatusEnum = {
  DRAFT: 1,
  PENDING_VALIDATION: 2,
  REVISION_REQUIRED: 3,
  SENT_TO_CLIENT: 4,
} as const;

export type QuoteStatusEnum =
  (typeof QuoteStatusEnum)[keyof typeof QuoteStatusEnum];

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
