import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class EducationStageEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_education_classification_branches');
  readonly store = this.url('store_education_classification_branch');
  readonly delete = this.url('delete_education_classification_branch');
  readonly update = this.url('update_education_classification_branch');
}
