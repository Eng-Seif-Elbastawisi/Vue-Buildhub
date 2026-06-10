import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class FaqsEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_faq');
  readonly show = this.url('show_faq');
  readonly store = this.url('store_faq');
  readonly update = this.url('update_faq');
  readonly delete = this.url('delete_faq');
}
