import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class LaborEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_labors');
  readonly show = this.url('show_labor');
  readonly store = this.url('store_labor');
  readonly update = this.url('update_labor');
  readonly delete = this.url('delete_labor');
}