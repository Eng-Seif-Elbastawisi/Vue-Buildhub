import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class AdminEndpoints extends BaseEndpoints {
  protected readonly prefix = 'organization/';

  readonly index = this.url('fetch_admins');
  readonly show = this.url('show_admin');
  readonly store = this.url('store_admin');
  readonly update = this.url('update_admin');
  readonly delete = this.url('delete_admin');
}
