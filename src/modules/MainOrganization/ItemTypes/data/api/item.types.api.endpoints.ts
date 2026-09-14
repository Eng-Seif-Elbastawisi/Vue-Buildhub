import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ItemTypesApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  readonly index = this.url('fetch_item_types');
  readonly show = this.url('show_item_type');
  readonly store = this.url('store_item_type');
  readonly update = this.url('update_item_type');
  readonly delete = this.url('delete_item_type');
}
