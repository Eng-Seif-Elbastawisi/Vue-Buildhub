import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiCallOptions, ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import type ChangePackageSubscriptionStatusParams from '../../core/params/change.package.subscription.status.params';
import type FetchPackageSubscriptionsParams from '../../core/params/fetch.package.subscriptions.params';
import { PackageEndpoints } from './package.api.endpoints';

export default class PackageApiService extends BaseApiService {
  private static instance: PackageApiService;

  private readonly packageEndpoints = new PackageEndpoints();

  static getInstance(): PackageApiService {
    if (!PackageApiService.instance) {
      PackageApiService.instance = new PackageApiService();
    }

    return PackageApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.packageEndpoints.index,
      show: this.packageEndpoints.show,
      create: this.packageEndpoints.store,
      update: this.packageEndpoints.update,
      delete: this.packageEndpoints.delete,
    };
  }

  public fetchPackageSubscriptions(
    params?: FetchPackageSubscriptionsParams,
    options?: ApiCallOptions,
  ) {
    return this.customPost(this.packageEndpoints.fetchPackageSubscriptions, params, options);
  }

  public changePackageSubscriptionStatus(
    params: ChangePackageSubscriptionStatusParams,
    options?: ApiCallOptions,
  ) {
    return this.customPost(this.packageEndpoints.changePackageSubscriptionStatus, params, options);
  }
}
