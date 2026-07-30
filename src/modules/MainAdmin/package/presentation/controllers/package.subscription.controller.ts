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
import { notifyDataMutationSucceeded } from '@/base/Presentation/Controller/dataMutationEvent';
import { translate } from '@/locales/i18n';
import type PackageSubscriptionModel from '../../core/models/package.subscription.model';
import type ChangePackageSubscriptionStatusParams from '../../core/params/change.package.subscription.status.params';
import type FetchPackageSubscriptionsParams from '../../core/params/fetch.package.subscriptions.params';
import PackageSubscriptionRepository from '../../data/repositories/package.subscription.repository';

export default class PackageSubscriptionController extends BaseController<
  PackageSubscriptionModel,
  PackageSubscriptionModel[]
> {
  private static instance: PackageSubscriptionController;

  public readonly statusUpdateState: Ref<DataState<void>> = ref(new DataInitial<void>()) as Ref<
    DataState<void>
  >;

  protected get repository(): PackageSubscriptionRepository {
    return PackageSubscriptionRepository.getInstance();
  }

  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: true,
      showSuccessDialog: false,
      showErrorDialog: false,
      showErrorTosat: true,
      showSuccessTosat: true,
      autoRetry: false,
      maxAutoRetries: 1,
    };
  }

  private constructor() {
    super();
  }

  public static getInstance(): PackageSubscriptionController {
    if (!PackageSubscriptionController.instance) {
      PackageSubscriptionController.instance = new PackageSubscriptionController();
    }

    return PackageSubscriptionController.instance;
  }

  public async fetchPackageSubscriptions(
    params?: FetchPackageSubscriptionsParams,
    options?: ApiCallOptions,
  ): Promise<DataState<PackageSubscriptionModel[]>> {
    return super.fetchList(params, {
      ...options,
      useJson: true,
    });
  }

  public async changePackageSubscriptionStatus(
    params: ChangePackageSubscriptionStatusParams,
  ): Promise<DataState<void>> {
    const validation = params.validate();

    if (!validation.isValid) {
      params.validateOrThrow();

      const failed = new DataFailed<void>({
        error: new ErrorModel(translate('package.change_status_error'), ErrorType.validation),
      });

      this.statusUpdateState.value = failed;

      return failed;
    }

    this.statusUpdateState.value = new DataLoading<void>();

    try {
      const result = await this.repository.changePackageSubscriptionStatus(params);

      this.statusUpdateState.value = result;

      if (result instanceof DataSuccess) {
        this.showSuccessToast(translate('package.status_updated_successfully'));
        notifyDataMutationSucceeded();
      } else if (result.hasError) {
        this.handleErrorResponse(result);
      }

      return result;
    } catch {
      const failed = new DataFailed<void>({
        error: new ErrorModel(translate('package.change_status_error'), ErrorType.unknown),
      });

      this.statusUpdateState.value = failed;
      this.handleErrorResponse(failed);

      return failed;
    }
  }
}
