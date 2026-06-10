import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class EducationTopicsEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly store = this.url('store_education_classification_subject_topic');
  readonly update = this.url('update_education_classification_subject_topic');
  readonly delete = this.url('delete_education_classification_subject_topic');
  readonly index = this.url('fetch_education_classification_subject_topics');
  readonly show = this.url('show_education_classification_subject_topic');
}
