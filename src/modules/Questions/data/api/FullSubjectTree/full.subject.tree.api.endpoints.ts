import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class FullSubjectTreeApiEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_full_education_classification_subjects');
}
