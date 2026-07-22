import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import type PricePercentageModel from '../../core/models/price.percentage.model';
import type UpdatePricePercentagesParams from '../../core/params/update.price.percentages.params';
import PricePercentageRepository from '../../data/repositories/price.percentage.repository';

export default class PricePercentageController extends BaseController<
  PricePercentageModel,
  PricePercentageModel[]
> {
  private static instance: PricePercentageController;

  protected get repository() {
    return PricePercentageRepository.getInstance();
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

  static getInstance(): PricePercentageController {
    if (!PricePercentageController.instance) {
      PricePercentageController.instance = new PricePercentageController();
    }

    return PricePercentageController.instance;
  }

  async updatePercentages(params: UpdatePricePercentagesParams, options?: ApiCallOptions) {
    return await super.update(params, { ...options, useJson: true });
  }
}
