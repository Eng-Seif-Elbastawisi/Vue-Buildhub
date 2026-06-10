import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class EducationSubjectEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly store = this.url('store_education_classification_configuration_subject');
  readonly index = this.url('fetch_education_classification_configuration_subject');
}
