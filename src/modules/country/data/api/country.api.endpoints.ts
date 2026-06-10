import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class CountryEndpoints extends BaseEndpoints {
  protected readonly prefix = 'general/';

  readonly index = this.url('fetch_countries');
}
