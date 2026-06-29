import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ProjectPreviewApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  readonly index = this.url('fetch_project_previews');
  readonly show = this.url('show_project_preview');
  readonly store = this.url('store_project_preview');
  readonly update = this.url('update_project_preview');
  readonly delete = this.url('delete_project_preview');
}
