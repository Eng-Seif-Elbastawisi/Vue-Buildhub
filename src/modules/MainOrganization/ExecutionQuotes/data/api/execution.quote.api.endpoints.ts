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
  readonly setSupervisionPricing = this.url('set_quote_supervision_percentage');
  readonly update = this.url('update_quote');
  readonly delete = this.url('delete_quote');
  readonly editQuoteItem = this.url('update_quote_stage_item');
  readonly deleteQuoteItem = this.url('delete_quote_stage_item');
}
