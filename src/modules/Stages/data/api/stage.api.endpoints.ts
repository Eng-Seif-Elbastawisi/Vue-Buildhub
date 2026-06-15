import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class StageEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('index_stages');
  readonly show = this.url('show_stage');
  readonly store = this.url('store_stage');
  readonly update = this.url('update_stage');
  readonly delete = this.url('delete_stage');
}
