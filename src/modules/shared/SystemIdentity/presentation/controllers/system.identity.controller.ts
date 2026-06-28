import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import type SystemIdentityShowModel from '../../core/models/system.identity.show.model';
import SystemIdentityRepository from '../../data/repositories/system.identity.repository';

export default class SystemIdentityController extends BaseController<
  SystemIdentityShowModel,
  SystemIdentityShowModel[]
> {
  private static instance: SystemIdentityController;

  protected get repository() {
    return SystemIdentityRepository.getInstance();
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

  private constructor() {
    super();
  }

  static getInstance(): SystemIdentityController {
    if (!SystemIdentityController.instance) {
      SystemIdentityController.instance = new SystemIdentityController();
    }

    return SystemIdentityController.instance;
  }

  async storeSetting(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<SystemIdentityShowModel>> {
    return await super.create(params, { ...options, useJson: true });
  }

  async showSetting(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, { ...options, useJson: true });
  }
}
