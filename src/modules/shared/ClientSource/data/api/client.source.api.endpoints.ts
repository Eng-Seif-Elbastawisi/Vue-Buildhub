import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ClientSourceEndpoints extends BaseEndpoints {
  // protected readonly prefix = 'dashboard/';
     protected get prefix(): string {
        return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
      }

  readonly index = this.url('fetch_client_sources'); 
  readonly show = this.url('show_client_source');
  readonly store = this.url('store_client_source');
  readonly update = this.url('update_client_source');
  readonly delete = this.url('delete_client_source');
}
