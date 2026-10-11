import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';
// Confirmed backend routes; response handling remains separate from request transport.
export class ScheduleEndpoints extends BaseEndpoints {
  protected get prefix() {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  get index() {
    return this.url('fetch_project_timelines');
  }
  get show() {
    return this.url('show_project_timeline');
  }
  get create() {
    return this.url('store_project_timeline');
  }
  get update() {
    return this.url('update_project_timeline');
  }
  get delete() {
    return this.url('delete_project_timeline');
  }
  get sort() {
    return this.url('change_project_timeline_order');
  }
  get settings() {
    return this.url('show_project_configuration');
  }
  get saveSettings() {
    return this.url('store_project_configuration');
  }
}
