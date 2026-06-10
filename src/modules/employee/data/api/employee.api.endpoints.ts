import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class EmployeeEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_employees');
  readonly show = this.url('show_employee');
  readonly store = this.url('store_employee');
  readonly update = this.url('update_employee');
  readonly delete = this.url('delete_employee');
}
