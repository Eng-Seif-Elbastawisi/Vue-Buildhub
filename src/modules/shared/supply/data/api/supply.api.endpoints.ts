import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class SupplyApiEndpoints extends BaseEndpoints {
  // protected readonly prefix = 'dashboard/';
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_supplies');
  readonly show = this.url('show_supply');
  readonly store = this.url('store_supply');
  readonly update = this.url('update_supply');
  readonly delete = this.url('delete_supply');
}
