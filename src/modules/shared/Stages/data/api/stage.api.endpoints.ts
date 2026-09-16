import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class StageEndpoints extends BaseEndpoints {
  // protected readonly prefix = 'dashboard/';
    protected get prefix(): string {
      return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
    }

  readonly index = this.url('fetch_stages');
  readonly show = this.url('show_stage');
  readonly store = this.url('store_stage');
  readonly update = this.url('update_stage');
  readonly delete = this.url('delete_stage');
  readonly changeOrder = this.url('change_stage_order');
}
