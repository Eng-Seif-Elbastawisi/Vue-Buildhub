import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class MeasurementEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('index_measurements');
  readonly show = this.url('show_measurement');
  readonly store = this.url('store_measurement');
  readonly update = this.url('update_measurement');
  readonly delete = this.url('delete_measurement');
}
