import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class EducationSubjectItemEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_education_classification_subjects');
  readonly store = this.url('store_education_classification_subject');
  readonly delete = this.url('delete_education_classification_subject');
  readonly update = this.url('update_education_classification_subject');
}
