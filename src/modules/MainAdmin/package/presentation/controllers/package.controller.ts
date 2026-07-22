import type Params from '@/base/Core/Params/params';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type PackageModel from '../../core/models/package.model';
import PackageRepository from '../../data/repositories/package.repository';

export default class PackageController extends BaseController<PackageModel, PackageModel[]> {
  private static instance: PackageController;

  protected get repository(): PackageRepository {
    return PackageRepository.getInstance();
  }

  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: true,
      showSuccessDialog: true,
      showErrorDialog: true,
      autoRetry: false,
      maxAutoRetries: 1,
    };
  }

  private constructor() {
    super();
  }

  static getInstance(): PackageController {
    if (!PackageController.instance) {
      PackageController.instance = new PackageController();
    }

    return PackageController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const creationState = await super.create(params, options);

    if (creationState instanceof DataSuccess) {
      await router.push({ name: 'Packages' });
      if (formKey) useFormsStore().clearFormData(formKey);
    }

    return creationState;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const updateState = await super.update(params, options);

    if (updateState instanceof DataSuccess) {
      await router.push({ name: 'Packages' });
      if (formKey) useFormsStore().clearFormData(formKey);
    }

    return updateState;
  }
}
