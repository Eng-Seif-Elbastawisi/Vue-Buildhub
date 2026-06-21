import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class ItemApiEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_item');
  readonly show = this.url('show_item');
  readonly store = this.url('add_item');
  readonly update = this.url('update_item');
  readonly delete = this.url('delete_item');
}
