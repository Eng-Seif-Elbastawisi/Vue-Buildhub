import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ProjectApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  readonly index = this.url('fetch_projects');
  readonly show = this.url('show_project');
  readonly store = this.url('store_project');
  readonly update = this.url('update_project');
  readonly delete = this.url('delete_project');
}

