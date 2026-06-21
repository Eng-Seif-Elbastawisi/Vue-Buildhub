import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class LocationApiEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_location');
  readonly show = this.url('show_location');
  readonly store = this.url('add_location');
  readonly update = this.url('update_location');
  readonly delete = this.url('delete_location');
}
