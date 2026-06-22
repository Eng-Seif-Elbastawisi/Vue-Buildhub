import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class MeasurementEndpoints extends BaseEndpoints {
  // protected readonly prefix = 'dashboard/';
    protected get prefix(): string {
        return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
      }

  readonly index = this.url('fetch_measurement_units');
  readonly show = this.url('show_measurement_unit');
  readonly store = this.url('store_measurement_unit');
  readonly update = this.url('update_measurement_unit');
  readonly delete = this.url('delete_measurement_unit');
}
