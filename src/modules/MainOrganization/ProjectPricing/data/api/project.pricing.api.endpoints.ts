import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ProjectPricingApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_project_pricings');
  readonly show = this.url('show_project_pricing');
  readonly store = this.url('store_project_pricing');
  readonly update = this.url('update_project_pricing');
  readonly delete = this.url('delete_project_pricing');
}
