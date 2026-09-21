import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ExecutionQuoteApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_execution_quotes');
  readonly show = this.url('show_execution_quote');
  readonly store = this.url('store_quote');
  readonly update = this.url('update_execution_quote');
  readonly delete = this.url('delete_execution_quote');
}
