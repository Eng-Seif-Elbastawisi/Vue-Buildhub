import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import SkillsRepository from '../../data/repositories/skills.repository';
import type SkillModel from '../../core/models/skills.model';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';

export default class SkillsController extends BaseController<SkillModel, SkillModel[]> {
  private static instance: SkillsController;

  protected get repository() {
    return SkillsRepository.getInstance();
  }

  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: false,
      showSuccessDialog: false,
      showErrorDialog: false,
      showSuccessTosat: true,
      showErrorTosat: true,
      autoRetry: false,
      maxAutoRetries: 1,
    };
  }

  private constructor() {
    super();
  }

  static getInstance(): SkillsController {
    if (!SkillsController.instance) {
      SkillsController.instance = new SkillsController();
    }
    return SkillsController.instance;
  }

  async create(params: Params, options?: ApiCallOptions) {
    const result = await super.create(params, { ...options, useJson: true });
    return result;
  }

  async update(params: Params, options?: ApiCallOptions) {
    const result = await super.update(params, { ...options, useJson: true });
    return result;
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    const res = await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as any).AllLocale ? '*' : 'en',
      },
    });
    return res;
  }
}
