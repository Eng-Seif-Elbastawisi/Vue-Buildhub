import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class EducationTreeEndpoints extends BaseEndpoints {
  protected readonly prefix = 'organization/';

  readonly index = this.url('fetch_tree_configuration');
  readonly add = this.url('add_tree_configuration');
}
