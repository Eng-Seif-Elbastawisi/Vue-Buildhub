export const InvoiceTypeEnum = {
  SINGLE: 1,
  GROUP: 2,
} as const;

export type InvoiceTypeEnum = (typeof InvoiceTypeEnum)[keyof typeof InvoiceTypeEnum];

export const InvoiceTypeLabelKeys: Record<InvoiceTypeEnum, string> = {
  [InvoiceTypeEnum.SINGLE]: 'invoice.type_single',
  [InvoiceTypeEnum.GROUP]: 'invoice.type_group',
};
