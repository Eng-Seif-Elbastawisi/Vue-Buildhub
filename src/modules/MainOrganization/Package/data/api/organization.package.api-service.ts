import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiCallOptions, ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { PackageEndpoints } from './package.api.endpoints';
import type FetchOrganizationPackageSubscriptionsParams from '../../core/params/fetch.organization.package.subscriptions.params';
import type FetchOrganizationPackagesParams from '../../core/params/fetch.organization.packages.params';
import type SubscribeToPackageParams from '../../core/params/subscribe.to.package.params';

export default class OrganizationPackageApiService extends BaseApiService {
  private static instance: OrganizationPackageApiService;

  private readonly packageEndpoints = new PackageEndpoints();

  public static getInstance(): OrganizationPackageApiService {
    if (!OrganizationPackageApiService.instance) {
      OrganizationPackageApiService.instance = new OrganizationPackageApiService();
    }

    return OrganizationPackageApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.packageEndpoints.index,
    };
  }

  public fetchPackages(params: FetchOrganizationPackagesParams, options?: ApiCallOptions) {
    return this.customPost(this.packageEndpoints.index, params, options);
  }

  public subscribeToPackage(params: SubscribeToPackageParams, options?: ApiCallOptions) {
    return this.customPost(this.packageEndpoints.subscribeToPackage, params, options);
  }

  public fetchPackageSubscriptions(
    params: FetchOrganizationPackageSubscriptionsParams,
    options?: ApiCallOptions,
  ) {
    return this.customPost(this.packageEndpoints.fetchPackageSubscriptions, params, options);
  }
}
