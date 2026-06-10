import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type StageModel from '@/modules/Stages/core/models/stage.model';
import FullSubjectTreeRepository from '../../../data/repositories/FullSubjectTree/full.subject.tree.repository';

export default class FullSubjectTreeController extends BaseController<StageModel, StageModel[]> {
  private static instance: FullSubjectTreeController;

  protected get repository() {
    return FullSubjectTreeRepository.getInstance();
  }

  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: false,
      showSuccessDialog: false,
      showSuccessTosat: true,
      showErrorDialog: false,
      showErrorTosat: true,
      autoRetry: false,
      maxAutoRetries: 1,
    };
  }

  private constructor() {
    super();
  }

  static getInstance(): FullSubjectTreeController {
    if (!FullSubjectTreeController.instance) {
      FullSubjectTreeController.instance = new FullSubjectTreeController();
    }
    return FullSubjectTreeController.instance;
  }
}
