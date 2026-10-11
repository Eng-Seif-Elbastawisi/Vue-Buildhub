import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class WarehouseApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  readonly index = this.url('fetch_warehouses');
  readonly show = this.url('show_warehouse');
  readonly store = this.url('store_warehouse');
  readonly update = this.url('update_warehouse');
  readonly delete = this.url('delete_warehouse');
}
