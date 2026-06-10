import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class EducationClassificationEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_education_classification');
  readonly show = this.url('show_education_classification');
  readonly store = this.url('store_education_classification');
  readonly update = this.url('update_education_classification');
  readonly delete = this.url('delete_education_classification');
  readonly toggleStatus = this.url('toggle_status_education_classification');
}
