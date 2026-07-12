import { describe, expect, it } from 'vitest';
import {
  InvoicePaymentMethodEnum,
  InvoicePaymentMethodOptions,
} from '../invoice.payment.method.enum';

describe('InvoicePaymentMethodEnum', () => {
  it('exposes stable payment method identifiers and options', () => {
    expect(InvoicePaymentMethodEnum).toEqual({
      BANK_TRANSFER: 1,
      CASH: 2,
      CHEQUE: 3,
      WALLET: 4,
    });
    expect(InvoicePaymentMethodOptions.map((option) => option.value)).toEqual([1, 2, 3, 4]);
  });
});
