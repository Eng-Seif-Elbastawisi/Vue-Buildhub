import { describe, expect, it } from 'vitest';
import { InvoiceActionStatusEnum } from '../../constant/invoice.action.status.enum';
import SetInvoiceActionParams from '../set.invoice.action.params';

describe('SetInvoiceActionParams', () => {
  it('maps the invoice action payload', () => {
    const params = new SetInvoiceActionParams({
      project_id: 30,
      action_status: InvoiceActionStatusEnum.OFFER_ACCEPT,
      invoice_ids: [23, 24],
    });

    expect(params.toMap()).toEqual({
      project_id: 30,
      action_status: 1,
      invoice_ids: [23, 24],
    });
    expect(params.validate().isValid).toBe(true);
  });

  it.each([
    ['missing action status', undefined, [23]],
    ['empty invoices', InvoiceActionStatusEnum.OFFER_ACCEPT, []],
  ])('rejects %s', (_scenario, action_status, invoice_ids) => {
    const params = new SetInvoiceActionParams({
      project_id: 30,
      action_status,
      invoice_ids,
    });

    expect(params.validate().isValid).toBe(false);
  });
});
