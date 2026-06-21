import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class DepartmentEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_department');
  readonly show = this.url('show_department');
  readonly store = this.url('store_department');
  readonly update = this.url('update_department');
  readonly delete = this.url('delete_department');
}
