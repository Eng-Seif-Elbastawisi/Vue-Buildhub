import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class ContractorApiEndpoints extends BaseEndpoints {
  protected readonly prefix = 'organization/';

  readonly index = this.url('fetch_contractors');
  readonly show = this.url('show_contractor');
  readonly store = this.url('store_contractor');
  readonly update = this.url('update_contractor');
  readonly delete = this.url('delete_contractor');
}
