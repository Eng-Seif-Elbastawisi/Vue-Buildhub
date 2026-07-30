import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions, ApiResponse } from '@/base/Data/ApiService/baseApiService';
import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import { HttpStatusCode } from 'axios';
import PackageSubscriptionModel from '../../core/models/package.subscription.model';
import type ChangePackageSubscriptionStatusParams from '../../core/params/change.package.subscription.status.params';
import FetchPackageSubscriptionsParams from '../../core/params/fetch.package.subscriptions.params';
import PackageApiService from '../api/package.api-service';

type PackageSubscriptionActionResponse = {
  status?: boolean;
  message?: string;
  data?: unknown;
};

const isRecord = (rawValue: unknown): rawValue is Record<string, unknown> =>
  rawValue !== null && typeof rawValue === 'object' && !Array.isArray(rawValue);

export default class PackageSubscriptionRepository extends BaseRepository<
  PackageSubscriptionModel,
  PackageSubscriptionModel[]
> {
  private static instance: PackageSubscriptionRepository;

  private constructor() {
    super();
  }

  public static getInstance(): PackageSubscriptionRepository {
    if (!PackageSubscriptionRepository.instance) {
      PackageSubscriptionRepository.instance = new PackageSubscriptionRepository();
    }

    return PackageSubscriptionRepository.instance;
  }

  protected get apiService(): PackageApiService {
    return PackageApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: false,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): PackageSubscriptionModel {
    return PackageSubscriptionModel.example;
  }

  protected get mockList(): PackageSubscriptionModel[] {
    return [PackageSubscriptionModel.example];
  }

  protected parseItem(rawSubscription: unknown): PackageSubscriptionModel {
    if (!isRecord(rawSubscription)) {
      return PackageSubscriptionModel.fromJson({});
    }

    return PackageSubscriptionModel.fromJson(rawSubscription);
  }

  protected parseList(rawSubscriptions: unknown): PackageSubscriptionModel[] {
    if (!Array.isArray(rawSubscriptions)) {
      return [];
    }

    return rawSubscriptions
      .filter(
        (rawSubscription): rawSubscription is Record<string, unknown> =>
          rawSubscription !== null &&
          typeof rawSubscription === 'object' &&
          !Array.isArray(rawSubscription),
      )
      .map((rawSubscription) => PackageSubscriptionModel.fromJson(rawSubscription));
  }

  private toFetchParams(params?: Params): FetchPackageSubscriptionsParams | undefined {
    if (params === undefined || params instanceof FetchPackageSubscriptionsParams) {
      return params;
    }

    return undefined;
  }

  async index(
    params?: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<PackageSubscriptionModel[]>> {
    return this.executeCustom(
      () => this.apiService.fetchPackageSubscriptions(this.toFetchParams(params), options),
      (rawSubscriptions: unknown) => this.parseList(rawSubscriptions),
      {
        captureRetryFn: options?.enableRetry,
      },
    );
  }

  private processActionResponse(
    response: ApiResponse<PackageSubscriptionActionResponse>,
  ): DataState<void> {
    const isSuccess =
      [HttpStatusCode.Ok, HttpStatusCode.Created, HttpStatusCode.Accepted].includes(
        response.statusCode,
      ) &&
      (response.data.status ?? true);

    if (isSuccess) {
      return new DataSuccess<void>({
        message: response.data.message,
      });
    }

    return new DataFailed<void>({
      error: new ErrorModel(
        response.data.message ?? 'package.change_status_error',
        ErrorType.serviceSide,
      ),
    });
  }

  public async changePackageSubscriptionStatus(
    params: ChangePackageSubscriptionStatusParams,
    options?: ApiCallOptions,
  ): Promise<DataState<void>> {
    try {
      const response = await this.apiService.changePackageSubscriptionStatus(params, options);

      return this.processActionResponse(response);
    } catch (error) {
      return this.handleError<void>(error);
    }
  }
}
