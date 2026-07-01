import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class SpaceApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  readonly index = this.url('fetch_spaces');
  readonly show = this.url('show_space');
  readonly store = this.url('store_space');
  readonly update = this.url('update_space');
  readonly delete = this.url('delete_space');
}
