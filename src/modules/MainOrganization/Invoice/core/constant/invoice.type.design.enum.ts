export const InvoiceDesignTypeEnum = {
  DESIGN: 1,
  EXECUTION: 2,
  BOTH: 3,
} as const;

export type InvoiceDesignTypeEnum = (typeof InvoiceDesignTypeEnum)[keyof typeof InvoiceDesignTypeEnum];

export const InvoiceDesignTypeLabelKeys: Record<InvoiceDesignTypeEnum, string> = {
  [InvoiceDesignTypeEnum.DESIGN]: 'invoice.type_design',
  [InvoiceDesignTypeEnum.EXECUTION]: 'invoice.type_execution',
  [InvoiceDesignTypeEnum.BOTH]: 'invoice.type_both',
};
