import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class ProjectApiEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';
  readonly index = this.url('fetch_project');
  readonly show = this.url('show_project');
  readonly store = this.url('store_project');
  readonly update = this.url('update_project');
  readonly delete = this.url('delete_project');
}
