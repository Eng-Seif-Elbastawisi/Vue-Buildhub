// import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

// export class PackageEndpoints extends BaseEndpoints {
//   protected readonly prefix = 'supervision/';

//   readonly index = this.url('fetch_packages');
//   readonly fetchPackages = this.index;
//   readonly show = this.url('show_package');
//   readonly store = this.url('store_package');
//   readonly update = this.url('update_package');
//   readonly delete = this.url('delete_package');
//   readonly subscribeToPackage = this.url('subscribe_to_package');
//   readonly fetchPackageSubscriptions = this.url('fetch_package_subscriptions');
//   readonly changePackageSubscriptionStatus = this.url('change_package_subscription_status');
// }

// import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

// export class BrandApiEndpoints extends BaseEndpoints {
//   protected readonly prefix = 'dashboard/';

//   readonly index = this.url('fetch_brand');
//   readonly show = this.url('show_brand');
//   readonly store = this.url('store_brand');
//   readonly update = this.url('update_brand');
//   readonly delete = this.url('delete_brand');
// }

//
import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';
export class PackageEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_packages');

  readonly show = this.url('show_package');
  readonly store = this.url('store_package');
  readonly update = this.url('update_package');
  readonly delete = this.url('delete_package');
  readonly subscribeToPackage = this.url('subscribe_to_package');
  readonly fetchPackageSubscriptions = this.url('fetch_package_subscriptions');
  readonly changePackageSubscriptionStatus = this.url('change_package_subscription_status');
}
