import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ProjectItemApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_project_items');
  readonly show = this.url('show_project_item');
  readonly store = this.url('store_new_project_item');
  readonly update = this.url('update_project_item');
  readonly delete = this.url('delete_project_item');
}
