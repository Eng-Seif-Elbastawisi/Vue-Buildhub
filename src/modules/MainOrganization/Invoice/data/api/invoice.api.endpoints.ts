import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class InvoiceApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_invoices');
  readonly show = this.url('show_invoice');
  readonly store = this.url('store_invoice');
  readonly update = this.url('update_invoice');
  readonly delete = this.url('delete_invoice');
  readonly export = this.url('export_invoice');
  readonly fetchAutoInvoices = this.url('fetch_auto_invoices');
  readonly setInvoiceAction = this.url('set_invoice_action');
}
