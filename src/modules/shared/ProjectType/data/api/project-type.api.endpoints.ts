import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ProjectTypeApiEndpoints extends BaseEndpoints {
  // protected readonly prefix = 'dashboard/';
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  readonly index = this.url('fetch_project_types');
  readonly show = this.url('show_project_type');
  readonly store = this.url('store_project_type');
  readonly update = this.url('update_project_type');
  readonly delete = this.url('delete_project_type');
}
