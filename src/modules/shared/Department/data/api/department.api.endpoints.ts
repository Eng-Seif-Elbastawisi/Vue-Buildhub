import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class DepartmentEndpoints extends BaseEndpoints {
  // protected readonly prefix = 'dashboard/';
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_departments');
  readonly show = this.url('show_department');
  readonly store = this.url('store_department');
  readonly update = this.url('update_department');
  readonly delete = this.url('delete_department');
}
