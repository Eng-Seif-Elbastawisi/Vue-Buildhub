import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class SpecializationApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  readonly index = this.url('fetch_specializations');
  readonly show = this.url('show_specialization');
  readonly store = this.url('store_specialization');
  readonly update = this.url('update_specialization');
  readonly delete = this.url('delete_specialization');
}
