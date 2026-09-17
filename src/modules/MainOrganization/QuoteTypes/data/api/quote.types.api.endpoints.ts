import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

import { useUserStore } from '@/stores/user';

export class QuoteTypeEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_quote_types');

  readonly show = this.url('show_quote_type');

  readonly store = this.url('store_quote_type');

  readonly update = this.url('update_quote_type');

  readonly delete = this.url('delete_quote_type');

  readonly changeOrder = this.url('change_quote_type_order');
}
