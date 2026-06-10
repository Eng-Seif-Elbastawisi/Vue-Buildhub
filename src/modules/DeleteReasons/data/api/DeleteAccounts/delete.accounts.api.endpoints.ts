import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class DeleteAccountsEndpoints extends BaseEndpoints {
  protected readonly prefix = 'organization/';

  readonly index = this.url('fetch_delete_accounts');
}
