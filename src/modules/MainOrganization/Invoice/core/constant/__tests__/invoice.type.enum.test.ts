import { describe, expect, it } from 'vitest';
import { InvoiceTypeEnum, InvoiceTypeLabelKeys } from '../invoice.type.enum';

describe('InvoiceTypeEnum', () => {
  it('exposes the API identifiers and localized label keys', () => {
    expect(InvoiceTypeEnum).toEqual({
      SINGLE: 1,
      GROUP: 2,
    });
    expect(InvoiceTypeLabelKeys).toEqual({
      [InvoiceTypeEnum.SINGLE]: 'invoice.type_single',
      [InvoiceTypeEnum.GROUP]: 'invoice.type_group',
    });
  });
});
