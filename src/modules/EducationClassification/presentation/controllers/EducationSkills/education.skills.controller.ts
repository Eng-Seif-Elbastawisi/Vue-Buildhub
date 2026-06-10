import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type EducationSkillsModel from '@/modules/EducationClassification/core/models/EducationSkills/education.skills.model';
import EducationSkillsRepository from '@/modules/EducationClassification/data/repositories/EducationSkills/education.skills.repository';

export default class EducationSkillsController extends BaseController<
  EducationSkillsModel,
  EducationSkillsModel[]
> {
  private static instance: EducationSkillsController;

  protected get repository() {
    return EducationSkillsRepository.getInstance();
  }

  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: true,
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

  static getInstance(): EducationSkillsController {
    if (!EducationSkillsController.instance) {
      EducationSkillsController.instance = new EducationSkillsController();
    }
    return EducationSkillsController.instance;
  }

  async create(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<EducationSkillsModel> | undefined> {
    return super.create(params, { ...options, useJson: true });
  }

  async update(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<EducationSkillsModel> | undefined> {
    return super.update(params, { ...options, useJson: true });
  }
}
