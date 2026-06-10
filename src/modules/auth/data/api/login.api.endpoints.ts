import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class LoginEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly login = this.url('login');
}
