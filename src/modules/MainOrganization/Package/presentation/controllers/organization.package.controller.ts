import type { Ref } from 'vue';
import { ref } from 'vue';
import {
  DataFailed,
  DataInitial,
  DataLoading,
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import { translate } from '@/locales/i18n';
import type OrganizationPackageModel from '../../core/models/organization.package.model';
import type OrganizationPackageSubscriptionModel from '../../core/models/organization.package.subscription.model';
import type FetchOrganizationPackageSubscriptionsParams from '../../core/params/fetch.organization.package.subscriptions.params';
import type FetchOrganizationPackagesParams from '../../core/params/fetch.organization.packages.params';
import type SubscribeToPackageParams from '../../core/params/subscribe.to.package.params';
import OrganizationPackageRepository from '../../data/repositories/organization.package.repository';

export default class OrganizationPackageController extends BaseController<
  OrganizationPackageModel,
  OrganizationPackageModel[]
> {
  private static instance: OrganizationPackageController;

  public readonly packagesState = this.listState;
  public readonly subscriptionsState: Ref<DataState<OrganizationPackageSubscriptionModel[]>> = ref(
    new DataInitial<OrganizationPackageSubscriptionModel[]>(),
  ) as Ref<DataState<OrganizationPackageSubscriptionModel[]>>;
  public readonly subscribeState: Ref<DataState<void>> = ref(new DataInitial<void>()) as Ref<
    DataState<void>
  >;

  private constructor() {
    super();
  }

  public static getInstance(): OrganizationPackageController {
    if (!OrganizationPackageController.instance) {
      OrganizationPackageController.instance = new OrganizationPackageController();
    }

    return OrganizationPackageController.instance;
  }

  protected get repository(): OrganizationPackageRepository {
    return OrganizationPackageRepository.getInstance();
  }

  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: false,
      showSuccessDialog: false,
      showErrorDialog: false,
      showErrorTosat: true,
      showSuccessTosat: true,
      autoRetry: false,
      maxAutoRetries: 1,
    };
  }

  public async fetchPackages(
    params: FetchOrganizationPackagesParams,
    options?: ApiCallOptions,
  ): Promise<DataState<OrganizationPackageModel[]>> {
    this.setListLoading();

    const packagesState = await this.repository.fetchPackages(params, {
      ...options,
      useJson: true,
      useStaticData: false,
    });

    this.setListState(packagesState);
    this.handleListResponse(packagesState);

    return packagesState;
  }

  public async fetchPackageSubscriptions(
    params: FetchOrganizationPackageSubscriptionsParams,
    options?: ApiCallOptions,
  ): Promise<DataState<OrganizationPackageSubscriptionModel[]>> {
    this.subscriptionsState.value = new DataLoading<OrganizationPackageSubscriptionModel[]>();

    const subscriptionsState = await this.repository.fetchPackageSubscriptions(params, {
      ...options,
      useJson: true,
      useStaticData: false,
    });

    this.subscriptionsState.value = subscriptionsState;

    if (subscriptionsState.hasError) {
      this.handleErrorResponse(subscriptionsState);
    }

    return subscriptionsState;
  }

  public async subscribeToPackage(
    params: SubscribeToPackageParams,
    options?: ApiCallOptions,
  ): Promise<DataState<void>> {
    if (this.subscribeState.value instanceof DataLoading) {
      return this.subscribeState.value;
    }

    const validation = params.validate();

    if (!validation.isValid) {
      params.validateOrThrow();

      return this.setSubscriptionValidationFailure();
    }

    this.subscribeState.value = new DataLoading<void>();

    const subscriptionState = await this.repository.subscribeToPackage(params, {
      ...options,
      useJson: true,
      useStaticData: false,
    });

    this.subscribeState.value = subscriptionState;
    this.presentSubscriptionFeedback(subscriptionState);

    return subscriptionState;
  }

  private setSubscriptionValidationFailure(): DataState<void> {
    const failedState = new DataFailed<void>({
      error: new ErrorModel(
        translate('organization_packages.subscription_failed'),
        ErrorType.validation,
      ),
    });

    this.subscribeState.value = failedState;

    return failedState;
  }

  private presentSubscriptionFeedback(subscriptionState: DataState<void>): void {
    if (subscriptionState instanceof DataSuccess) {
      this.showSuccessToast(
        subscriptionState.message ??
          translate('organization_packages.subscription_created_successfully'),
      );
      return;
    }

    if (subscriptionState.hasError) {
      this.handleErrorResponse(subscriptionState);
    }
  }

  public resetSubscribeState(): void {
    if (!(this.subscribeState.value instanceof DataLoading)) {
      this.subscribeState.value = new DataInitial<void>();
    }
  }
}
