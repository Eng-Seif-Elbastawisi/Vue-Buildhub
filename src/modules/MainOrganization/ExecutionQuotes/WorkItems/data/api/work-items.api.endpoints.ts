import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class WorkItemsEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  get fetchDrawings() {
    return this.url('fetch_shop_drawing_quotes');
  }
  get storeDrawing() {
    return this.url('store_shop_drawing_quote');
  }
  get fetchTasks() {
    return this.url('fetch_project_timeline_stage_tasks');
  }
  get storeTask() {
    return this.url('store_project_timeline_stage_task');
  }
  get fetchReports() {
    return this.url('fetch_project_timeline_stage_reports');
  }
  get storeReport() {
    return this.url('store_project_timeline_stage_report');
  }
  get fetchActivities() {
    return this.url('fetch_project_timeline_stage_meetings');
  }
  get storeActivity() {
    return this.url('store_project_timeline_stage_meeting');
  }
}
