export const InvoiceActionStatusEnum = {
  OFFER_ACCEPT: 1,
} as const;

export type InvoiceActionStatus =
  (typeof InvoiceActionStatusEnum)[keyof typeof InvoiceActionStatusEnum];

export const InvoiceActionStatusLabelKeys: Record<InvoiceActionStatus, string> = {
  [InvoiceActionStatusEnum.OFFER_ACCEPT]: 'invoice_action.status_offer_accept',
};
