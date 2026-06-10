import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class AboutEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_about_us');
  readonly show = this.url('show_about_us');
  readonly store = this.url('store_about_us');
  readonly update = this.url('store_about_us');
  readonly delete = this.url('delete_about_us');
  readonly deleteSocialLink = this.url('delete_social_link');
}
