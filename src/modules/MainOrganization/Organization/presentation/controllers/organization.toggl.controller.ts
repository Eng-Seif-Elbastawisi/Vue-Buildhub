import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type OrganizationToggledModel from '../../core/models/organization.toggle.model';
import OrganizationRepository from '../../data/repositories/organization.toggl.repository';

export default class OrganizationController extends BaseController<
  OrganizationToggledModel,
  OrganizationToggledModel[]
> {
  private static instance: OrganizationController;

  protected get repository() {
    return OrganizationRepository.getInstance();
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

  static getInstance(): OrganizationController {
    if (!OrganizationController.instance) {
      OrganizationController.instance = new OrganizationController();
    }
    return OrganizationController.instance;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<OrganizationToggledModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async showSetting(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<OrganizationToggledModel>> {
    return await super.fetchOne(params, { ...options, useJson: true });
  }

  async toggleSetting(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<OrganizationToggledModel> | undefined> {
    return await super.create(params, { ...options, useJson: true });
  }
}
