import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class TermsConditionsEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_term');
  readonly show = this.url('show_term');
  readonly store = this.url('store_term');
  readonly update = this.url('update_term');
  readonly delete = this.url('delete_term');
}
