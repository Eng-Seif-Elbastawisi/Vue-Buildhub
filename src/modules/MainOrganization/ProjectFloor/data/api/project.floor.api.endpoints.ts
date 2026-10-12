import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ProjectFloorApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  readonly index = this.url('fetch_project_floors');
  readonly show = this.url('show_project_floor');
  readonly store = this.url('store_project_floor');
  readonly update = this.url('update_project_floor');
  readonly delete = this.url('delete_project_floor');

  readonly addSpaces = this.url('add_project_floor_spaces');

  readonly getProject = this.url('update_project_preview_status');
}
