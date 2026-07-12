import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class InvoicePaymentApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_invoice_payments');
  readonly show = this.url('show_invoice_payment');
  readonly store = this.url('store_invoice_payment');
  readonly update = this.url('update_invoice_payment');
  readonly delete = this.url('delete_invoice_payment');
}
