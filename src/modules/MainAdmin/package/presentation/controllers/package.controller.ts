import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import type PackageModel from '../../core/models/package.model';
import PackageRepository from '../../data/repositories/package.repository';
import type ShowPackageModel from '../../core/models/package.show.model';
import type ShowPackageParams from '../../core/params/show.package.params';
export default class PackageController extends BaseController<ShowPackageModel, PackageModel[]> {
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

  async create(params: Params, options?: ApiCallOptions) {
    const creationState = await super.create(params, {
      useJson: true,
      ...options,
    });
    // if (creationState instanceof DataSuccess) {
    await router.push({ name: 'Packages' });
    // }
    return creationState;
  }

  async update(params: Params, options?: ApiCallOptions) {
    const updateState = await super.update(params, {
      useJson: true,
      ...options,
    });
    await router.push({ name: 'Packages' });

    return updateState;
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowPackageParams).allLocales ? '*' : 'en',
      },
    });
  }
}
