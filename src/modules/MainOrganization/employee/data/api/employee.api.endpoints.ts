import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class EmployeeEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_employees');
  readonly show = this.url('show_employee');
  readonly store = this.url('store_employee');
  readonly update = this.url('update_employee');
  readonly delete = this.url('delete_employee');
}
