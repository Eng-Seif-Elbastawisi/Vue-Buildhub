import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class SkillsEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_skills');
  readonly store = this.url('store_skill');
  readonly show = this.url('show_skill');
  readonly update = this.url('update_skill');
  readonly delete = this.url('delete_skill');
}
