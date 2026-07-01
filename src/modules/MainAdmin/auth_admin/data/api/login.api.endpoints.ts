import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class LoginEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return 'mainportal/';
  }

  readonly login = this.url('login');
}
