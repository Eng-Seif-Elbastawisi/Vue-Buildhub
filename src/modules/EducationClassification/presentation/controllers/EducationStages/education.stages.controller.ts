import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type EducationStageModel from '@/modules/EducationClassification/core/models/EducationStage/education.stages.model';
import EducationStageRepository from '@/modules/EducationClassification/data/repositories/EducationStage/education.stages.repository';

export default class EducationStageController extends BaseController<
  EducationStageModel,
  EducationStageModel[]
> {
  private static instance: EducationStageController;

  protected get repository() {
    return EducationStageRepository.getInstance();
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

  static getInstance(): EducationStageController {
    if (!EducationStageController.instance) {
      EducationStageController.instance = new EducationStageController();
    }
    return EducationStageController.instance;
  }

  async create(params: Params, options?: ApiCallOptions) {
    return super.create(params, { ...options, useJson: true });
  }
}
