import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type StageModel from '../../core/models/stage.model';
import StageRepository from '../../data/repositories/stage.repository';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type ShowStageParams from '../../core/params/show.stage.params';

export default class StageController extends BaseController<StageModel, StageModel[]> {
  private static instance: StageController;

  protected get repository() {
    return StageRepository.getInstance();
  }

  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: false,
      showSuccessDialog: false,
      showErrorDialog: false,
      autoRetry: false,
      showErrorTosat: true,
      showSuccessTosat: true,
      maxAutoRetries: 1,
    };
  }

  private constructor() {
    super();
  }

  static getInstance(): StageController {
    if (!StageController.instance) {
      StageController.instance = new StageController();
    }
    return StageController.instance;
  }
  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowStageParams).allLocales ? '*' : 'en',
      },
    });
  }
}
