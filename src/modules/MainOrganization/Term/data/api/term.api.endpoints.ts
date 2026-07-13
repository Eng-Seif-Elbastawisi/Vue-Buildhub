import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class TermApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  readonly index = this.url('fetch_terms');
  readonly show = this.url('show_term');
  readonly store = this.url('store_term');
  readonly update = this.url('update_term');
  readonly delete = this.url('delete_term');
}
