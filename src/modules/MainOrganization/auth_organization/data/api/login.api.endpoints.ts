import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class LoginEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return 'organization/';
  }

  readonly login = this.url('employee/login');
}
