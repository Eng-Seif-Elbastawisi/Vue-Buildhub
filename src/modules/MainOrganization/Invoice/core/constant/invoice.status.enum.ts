export const InvoiceStatusEnum = {
  UNPAID: 1,
  PARTIAL: 2,
  PAID: 3,
  EXTRA_PAID: 4,
} as const;

export type InvoiceStatusEnum = (typeof InvoiceStatusEnum)[keyof typeof InvoiceStatusEnum];

export const InvoiceStatusLabelKeys: Record<InvoiceStatusEnum, string> = {
  [InvoiceStatusEnum.UNPAID]: 'invoice_show.status_unpaid',
  [InvoiceStatusEnum.PARTIAL]: 'invoice_show.status_partial',
  [InvoiceStatusEnum.PAID]: 'invoice_show.status_paid',
  [InvoiceStatusEnum.EXTRA_PAID]: 'invoice_show.status_extra_paid',
};
