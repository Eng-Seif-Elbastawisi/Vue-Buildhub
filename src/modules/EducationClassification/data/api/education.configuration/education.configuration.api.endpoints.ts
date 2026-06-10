import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class EducationConfigurationEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly store = this.url('store_education_classification_configuration');
  readonly index = this.url('fetch_education_classification_configuration');
}
