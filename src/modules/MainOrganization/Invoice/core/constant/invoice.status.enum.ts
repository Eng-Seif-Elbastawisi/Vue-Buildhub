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

export type InvoiceStatusClassName = 'is-unpaid' | 'is-partial' | 'is-paid' | 'is-extra-paid';

export const InvoiceStatusClassNames: Record<InvoiceStatusEnum, InvoiceStatusClassName> = {
  [InvoiceStatusEnum.UNPAID]: 'is-unpaid',
  [InvoiceStatusEnum.PARTIAL]: 'is-partial',
  [InvoiceStatusEnum.PAID]: 'is-paid',
  [InvoiceStatusEnum.EXTRA_PAID]: 'is-extra-paid',
};

export const normalizeInvoiceStatus = (
  value?: string | number | null,
): InvoiceStatusEnum | undefined => {
  const numericValue = Number(value);

  if (
    numericValue === InvoiceStatusEnum.UNPAID ||
    numericValue === InvoiceStatusEnum.PARTIAL ||
    numericValue === InvoiceStatusEnum.PAID ||
    numericValue === InvoiceStatusEnum.EXTRA_PAID
  ) {
    return numericValue;
  }

  const normalizedValue = String(value ?? '')
    .trim()
    .toLowerCase();

  if (normalizedValue === 'unpaid') return InvoiceStatusEnum.UNPAID;
  if (normalizedValue === 'partial') return InvoiceStatusEnum.PARTIAL;
  if (normalizedValue === 'paid') return InvoiceStatusEnum.PAID;
  if (normalizedValue === 'extra_paid' || normalizedValue === 'extra paid') {
    return InvoiceStatusEnum.EXTRA_PAID;
  }

  return undefined;
};
