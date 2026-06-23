import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type measurementModel from '../../core/models/measurement.model';
import MeasurementRepository from '../../data/repositories/measurement.repository';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type ShowMeasurementParams from '../../core/params/show.measurement.params';

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
    async fetchOne(params: Params, options?: ApiCallOptions) {
      return await super.fetchOne(params, {
        ...options,
        useJson: true,
        headers: {
          'Accept-Language': (params as ShowMeasurementParams).allLocales ? '*' : 'en',
        },
      });
    }
}
