import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class EducationSkillsEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly store = this.url('store_education_classification_subject_skill');
  readonly update = this.url('update_education_classification_subject_skill');
  readonly delete = this.url('delete_education_classification_subject_skill');
  readonly index = this.url('fetch_education_classification_subject_skills');
  readonly show = this.url('show_education_classification_subject_skill');
}
