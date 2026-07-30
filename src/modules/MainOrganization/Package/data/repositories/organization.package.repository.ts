import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type { ApiCallOptions, ApiResponse } from '@/base/Data/ApiService/baseApiService';
import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import { HttpStatusCode } from 'axios';
import OrganizationPackageModel from '../../core/models/organization.package.model';
import OrganizationPackageSubscriptionModel from '../../core/models/organization.package.subscription.model';
import type FetchOrganizationPackageSubscriptionsParams from '../../core/params/fetch.organization.package.subscriptions.params';
import type FetchOrganizationPackagesParams from '../../core/params/fetch.organization.packages.params';
import type SubscribeToPackageParams from '../../core/params/subscribe.to.package.params';
import OrganizationPackageApiService from '../api/organization.package.api-service';

interface SubscriptionActionResponse {
  status?: boolean;
  message?: string;
  data?: unknown;
}

const isRecord = (rawValue: unknown): rawValue is Record<string, unknown> =>
  rawValue !== null && typeof rawValue === 'object' && !Array.isArray(rawValue);

export default class OrganizationPackageRepository extends BaseRepository<
  OrganizationPackageModel,
  OrganizationPackageModel[]
> {
  private static instance: OrganizationPackageRepository;

  private constructor() {
    super();
  }

  public static getInstance(): OrganizationPackageRepository {
    if (!OrganizationPackageRepository.instance) {
      OrganizationPackageRepository.instance = new OrganizationPackageRepository();
    }

    return OrganizationPackageRepository.instance;
  }

  protected get apiService(): OrganizationPackageApiService {
    return OrganizationPackageApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: false,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): OrganizationPackageModel {
    return OrganizationPackageModel.example;
  }

  protected get mockList(): OrganizationPackageModel[] {
    return [OrganizationPackageModel.example];
  }

  protected parseItem(rawPackage: unknown): OrganizationPackageModel {
    return OrganizationPackageModel.fromJson(rawPackage);
  }

  protected parseList(rawPackages: unknown): OrganizationPackageModel[] {
    if (!Array.isArray(rawPackages)) {
      return [];
    }

    return rawPackages.filter(isRecord).map(OrganizationPackageModel.fromJson);
  }

  private parseSubscriptions(rawSubscriptions: unknown): OrganizationPackageSubscriptionModel[] {
    if (!Array.isArray(rawSubscriptions)) {
      return [];
    }

    return rawSubscriptions.filter(isRecord).map(OrganizationPackageSubscriptionModel.fromJson);
  }

  public async fetchPackages(
    params: FetchOrganizationPackagesParams,
    options?: ApiCallOptions,
  ): Promise<DataState<OrganizationPackageModel[]>> {
    return this.executeCustom(
      () => this.apiService.fetchPackages(params, options),
      (rawPackages) => this.parseList(rawPackages),
      { captureRetryFn: options?.enableRetry },
    );
  }

  public async fetchPackageSubscriptions(
    params: FetchOrganizationPackageSubscriptionsParams,
    options?: ApiCallOptions,
  ): Promise<DataState<OrganizationPackageSubscriptionModel[]>> {
    return this.executeCustom(
      () => this.apiService.fetchPackageSubscriptions(params, options),
      (rawSubscriptions) => this.parseSubscriptions(rawSubscriptions),
      { captureRetryFn: options?.enableRetry },
    );
  }

  private subscriptionResponseState(
    response: ApiResponse<SubscriptionActionResponse>,
  ): DataState<void> {
    const acceptedStatus = [
      HttpStatusCode.Ok,
      HttpStatusCode.Created,
      HttpStatusCode.Accepted,
    ].includes(response.statusCode);

    if (acceptedStatus && (response.data.status ?? true)) {
      return new DataSuccess<void>({ message: response.data.message });
    }

    return new DataFailed<void>({
      error: new ErrorModel(
        response.data.message ?? 'organization_packages.subscription_failed',
        ErrorType.serviceSide,
      ),
    });
  }

  public async subscribeToPackage(
    params: SubscribeToPackageParams,
    options?: ApiCallOptions,
  ): Promise<DataState<void>> {
    try {
      const response = await this.apiService.subscribeToPackage(params, options);

      return this.subscriptionResponseState(response);
    } catch (subscriptionError) {
      return this.handleError<void>(subscriptionError);
    }
  }
}
