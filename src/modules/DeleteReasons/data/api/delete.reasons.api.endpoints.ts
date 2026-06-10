import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class DeleteReasonsEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_delete_account_reasons');
  readonly create = this.url('store_delete_account_reason');
  readonly edit = this.url('update_delete_account_reason');
  readonly show = this.url('show_delete_account_reason');
  readonly delete = this.url('delete_delete_account_reason');
}
