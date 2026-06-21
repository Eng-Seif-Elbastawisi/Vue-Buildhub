import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type measurementModel from '../../core/models/stage.model';
import MeasurementRepository from '../../data/repositories/measurement.repository';

export default class MeasurementController extends BaseController<
  measurementModel,
  measurementModel[]
> {
  private static instance: MeasurementController;

  protected get repository() {
    return MeasurementRepository.getInstance();
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

  static getInstance(): MeasurementController {
    if (!MeasurementController.instance) {
      MeasurementController.instance = new MeasurementController();
    }
    return MeasurementController.instance;
  }
}
