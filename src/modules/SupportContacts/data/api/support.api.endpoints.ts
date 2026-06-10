import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class SupportContactsEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_support');
  readonly show = this.url('show_support');
  readonly store = this.url('store_support');
  readonly update = this.url('update_support');
  readonly delete = this.url('delete_support');
}
