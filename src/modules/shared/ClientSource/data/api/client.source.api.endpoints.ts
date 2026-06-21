import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class ClientSourceEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('index_client_sources');
  readonly show = this.url('show_client_source');
  readonly store = this.url('store_client_source');
  readonly update = this.url('update_client_source');
  readonly delete = this.url('delete_client_source');
}
