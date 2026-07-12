export const InvoicePaymentMethodEnum = {
  BANK_TRANSFER: 1,
  CASH: 2,
  CHEQUE: 3,
  WALLET: 4,
} as const;

export type InvoicePaymentMethodEnum =
  (typeof InvoicePaymentMethodEnum)[keyof typeof InvoicePaymentMethodEnum];

export const InvoicePaymentMethodOptions = [
  {
    value: InvoicePaymentMethodEnum.BANK_TRANSFER,
    labelKey: 'invoice_show.payment_method_bank_transfer',
  },
  {
    value: InvoicePaymentMethodEnum.CASH,
    labelKey: 'invoice_show.payment_method_cash',
  },
  {
    value: InvoicePaymentMethodEnum.CHEQUE,
    labelKey: 'invoice_show.payment_method_cheque',
  },
  {
    value: InvoicePaymentMethodEnum.WALLET,
    labelKey: 'invoice_show.payment_method_wallet',
  },
] as const;
