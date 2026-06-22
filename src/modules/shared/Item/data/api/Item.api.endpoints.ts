import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ItemApiEndpoints extends BaseEndpoints {
  // protected readonly prefix = 'dashboard/';
   protected get prefix(): string {
      return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
    }

  readonly index = this.url('fetch_items');
  readonly show = this.url('show_item');
  readonly store = this.url('store_item');
  readonly update = this.url('update_item');
  readonly delete = this.url('delete_item');
}
