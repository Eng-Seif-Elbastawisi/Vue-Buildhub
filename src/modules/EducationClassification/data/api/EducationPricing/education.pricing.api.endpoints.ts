import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class EducationPricingEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly store = this.url('store_education_classification_subject_pricing');
  readonly update = this.url('update_education_classification_subject_pricing');
  readonly delete = this.url('delete_education_classification_subject_pricing');
  readonly index = this.url('fetch_education_classification_subject_pricing');
  readonly show = this.url('show_education_classification_subject_pricing');
}
