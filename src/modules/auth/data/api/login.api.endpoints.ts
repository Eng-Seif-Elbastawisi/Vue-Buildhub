import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class LoginEndpoints extends BaseEndpoints {
  protected readonly prefix = 'organization/'; 

  readonly login = this.url('employee/login');
}
 