import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class MaterialApiEndpoints extends BaseEndpoints {
  // protected readonly prefix = 'dashboard/';
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_materials');
  readonly show = this.url('show_material');
  readonly store = this.url('store_material');
  readonly update = this.url('update_material');
  readonly delete = this.url('delete_material');
  readonly fetchStats = this.url('fetch_material_statses');
}
