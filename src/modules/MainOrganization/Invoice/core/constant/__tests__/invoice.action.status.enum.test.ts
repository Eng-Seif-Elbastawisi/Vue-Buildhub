import { describe, expect, it } from 'vitest';
import {
  InvoiceActionStatusEnum,
  InvoiceActionStatusLabelKeys,
} from '../invoice.action.status.enum';

describe('InvoiceActionStatusEnum', () => {
  it('provides a translation key for every supported action status', () => {
    const supportedStatuses = Object.values(InvoiceActionStatusEnum);

    expect(supportedStatuses.every((status) => InvoiceActionStatusLabelKeys[status])).toBe(true);
  });
});
