import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ExecutionQuoteApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_quotes');
  readonly show = this.url('show_quote');
  readonly store = this.url('store_quote');
  readonly storeDetails = this.url('store_quote_stage');
  readonly setStagePricing = this.url('set_quote_stage_client_price');
  readonly update = this.url('update_quote');
  readonly delete = this.url('delete_quote');
}
