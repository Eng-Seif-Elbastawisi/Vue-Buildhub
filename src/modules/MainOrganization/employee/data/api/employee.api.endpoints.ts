import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class EmployeeEndpoints extends BaseEndpoints {
  protected readonly prefix = 'organization/';

  readonly index = this.url('fetch_employee');
  readonly show = this.url('show_employee');
  readonly store = this.url('store_employee');
  readonly update = this.url('update_employee');
  readonly delete = this.url('delete_employee');
}
