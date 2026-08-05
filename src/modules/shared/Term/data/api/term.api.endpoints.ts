import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class TermEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  readonly index = this.url('fetch_terms');
  readonly show = this.url('show_terms');
  readonly store = this.url('store_term');
  readonly update = this.url('update_terms');
  readonly delete = this.url('delete_terms');
}
