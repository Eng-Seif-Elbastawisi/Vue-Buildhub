import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class OrganizationEndpoints extends BaseEndpoints {
  // protected readonly prefix = 'dashboard/';
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'organization/' : 'mainportal/';
  }

  readonly index = this.url('fetch_organizations');
  readonly show = this.url('show_organization');
  readonly store = this.url('store_organization');
  readonly update = this.url('update_organization');
  readonly delete = this.url('delete_organization');
}
