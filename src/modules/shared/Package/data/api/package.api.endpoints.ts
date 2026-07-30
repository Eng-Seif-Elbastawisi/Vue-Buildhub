import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class PackageEndpoints extends BaseEndpoints {
  protected readonly prefix = 'mainportal/';

  readonly index = this.url('fetch_packages');
  readonly fetchPackages = this.index;
  readonly show = this.url('show_package');
  readonly store = this.url('store_package');
  readonly update = this.url('update_package');
  readonly delete = this.url('delete_package');
  readonly subscribeToPackage = this.url('subscribe_to_package');
  readonly fetchPackageSubscriptions = this.url('fetch_package_subscriptions');
  readonly changePackageSubscriptionStatus = this.url('change_package_subscription_status');
}
