import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import EducationSubjectItemRepository from '@/modules/EducationClassification/data/repositories/educationSubject/education.subject.item.repository';
import type EducationSubjectModel from '@/modules/EducationClassification/core/models/EducationSubject/education.subject.model';

export default class EducationSubjectItemController extends BaseController<
  EducationSubjectModel,
  EducationSubjectModel[]
> {
  private static instance: EducationSubjectItemController;

  protected get repository() {
    return EducationSubjectItemRepository.getInstance();
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

  static getInstance(): EducationSubjectItemController {
    if (!EducationSubjectItemController.instance) {
      EducationSubjectItemController.instance = new EducationSubjectItemController();
    }
    return EducationSubjectItemController.instance;
  }

  async create(params: Params, options?: ApiCallOptions) {
    return super.create(params, { ...options, useJson: true });
  }

  async update(params: Params, options?: ApiCallOptions) {
    return super.update(params, { ...options, useJson: true });
  }
}
