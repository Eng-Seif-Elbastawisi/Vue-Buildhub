import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class ArticleEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_packages');
  readonly show = this.url('show_package');
  readonly store = this.url('store_package');
  readonly update = this.url('update_package');
  readonly delete = this.url('delete_package');
}
