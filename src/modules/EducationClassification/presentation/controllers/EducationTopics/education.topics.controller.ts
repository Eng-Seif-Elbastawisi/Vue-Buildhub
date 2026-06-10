import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type EducationTopicModel from '@/modules/EducationClassification/core/models/EducationTopic/education.tpoic.model';
import type ShowEducationTopicModel from '@/modules/EducationClassification/core/models/EducationTopic/show.education.tpoic.model';
import EducationTopicsRepository from '@/modules/EducationClassification/data/repositories/EducationTopics/education.topic.repository';

export default class EducationTopicsController extends BaseController<
  ShowEducationTopicModel,
  EducationTopicModel[]
> {
  private static instance: EducationTopicsController;

  protected get repository() {
    return EducationTopicsRepository.getInstance();
  }

  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: false,
      showSuccessDialog: false,
      showErrorTosat: true,
      showSuccessTosat: true,
      showErrorDialog: false,
      autoRetry: false,
      maxAutoRetries: 1,
    };
  }

  private constructor() {
    super();
  }

  static getInstance(): EducationTopicsController {
    if (!EducationTopicsController.instance) {
      EducationTopicsController.instance = new EducationTopicsController();
    }
    return EducationTopicsController.instance;
  }

  async create(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<ShowEducationTopicModel> | undefined> {
    return super.create(params, { ...options, useJson: true });
  }

  async update(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<ShowEducationTopicModel> | undefined> {
    return super.update(params, { ...options, useJson: true });
  }
}
