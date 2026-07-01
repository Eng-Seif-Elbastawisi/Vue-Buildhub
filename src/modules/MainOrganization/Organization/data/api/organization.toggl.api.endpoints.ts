import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class OrganizationEndpoints extends BaseEndpoints {
  // protected readonly prefix = 'dashboard/';
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly show = this.url('show_fetch_from');
  readonly store = this.url('toggle_fetch_from');
}
