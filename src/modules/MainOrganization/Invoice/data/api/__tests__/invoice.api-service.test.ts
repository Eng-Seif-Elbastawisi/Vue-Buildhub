import { describe, expect, it, vi } from 'vitest';
import ExportInvoiceParams from '../../../core/params/export.invoice.params';
import FetchAutoInvoicesParams from '../../../core/params/fetch.auto.invoices.params';
import { InvoiceActionStatusEnum } from '../../../core/constant/invoice.action.status.enum';
import SetInvoiceActionParams from '../../../core/params/set.invoice.action.params';
import InvoiceApiService from '../invoice.api-service';

describe('InvoiceApiService', () => {
  it('returns the same singleton instance', () => {
    expect(InvoiceApiService.getInstance()).toBe(InvoiceApiService.getInstance());
  });

  it('maps base API actions to invoice endpoints', () => {
    const service = InvoiceApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints.index).toContain('mainportal/fetch_invoices');
    expect(service.endpoints.create).toContain('mainportal/store_invoice');
    expect(service.endpoints.update).toContain('mainportal/update_invoice');
    expect(service.endpoints.delete).toContain('mainportal/delete_invoice');
  });

  it('posts to export invoice endpoint', async () => {
    const service = InvoiceApiService.getInstance();
    const customPost = vi
      .spyOn(
        service as unknown as {
          customPost: InvoiceApiService['customPost'];
        },
        'customPost',
      )
      .mockResolvedValue({
        statusCode: 200,
        data: { status: true, data: { invoice_id: 7 } },
      });
    const params = new ExportInvoiceParams({ invoice_id: 7 });

    await service.exportInvoice(params);

    expect(customPost).toHaveBeenCalledWith(
      expect.stringContaining('mainportal/export_invoice'),
      params,
      undefined,
    );

    customPost.mockRestore();
  });

  it('posts auto-invoice queries and invoice actions to their endpoints', async () => {
    const service = InvoiceApiService.getInstance();
    const customPost = vi
      .spyOn(
        service as unknown as {
          customPost: InvoiceApiService['customPost'];
        },
        'customPost',
      )
      .mockResolvedValue({ statusCode: 200, data: { status: true, data: [] } });
    const fetchParams = new FetchAutoInvoicesParams({ project_id: 30 });
    const actionParams = new SetInvoiceActionParams({
      project_id: 30,
      action_status: InvoiceActionStatusEnum.OFFER_ACCEPT,
      invoice_ids: [23, 24],
    });

    await service.fetchAutoInvoices(fetchParams);
    await service.setInvoiceAction(actionParams);

    expect(customPost).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('mainportal/fetch_auto_invoices'),
      fetchParams,
      undefined,
    );
    expect(customPost).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('mainportal/set_invoice_action'),
      actionParams,
      undefined,
    );

    customPost.mockRestore();
  });
});
