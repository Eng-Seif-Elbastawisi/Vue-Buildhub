import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class LocationApiEndpoints extends BaseEndpoints {
  // protected readonly prefix = 'dashboard/';
   protected get prefix(): string {
      return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
    }

  readonly index = this.url('fetch_locations');
  readonly show = this.url('show_location');
  readonly store = this.url('store_location');
  readonly update = this.url('update_location');
  readonly delete = this.url('delete_location');
}
