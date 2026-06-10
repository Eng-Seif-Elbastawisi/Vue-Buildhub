import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type EducationPricingModel from '@/modules/EducationClassification/core/models/EducationPricing/education.pricing.model';
import EducationPricingRepository from '@/modules/EducationClassification/data/repositories/EducationPricing/education.pricing.repository';

/**
 * Education Pricing Controller for managing education pricing
 *
 * This controller provides methods for CRUD operations on education pricing.
 */
export default class EducationPricingController extends BaseController<
  EducationPricingModel,
  EducationPricingModel[]
> {
  private static instance: EducationPricingController;

  protected get repository() {
    return EducationPricingRepository.getInstance();
  }

  /**
   * Controller configuration
   * Defines behavior for loading, success, and error dialogs
   */
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

  /**
   * Get singleton instance
   * @returns EducationClassificationController instance
   */
  static getInstance(): EducationPricingController {
    if (!EducationPricingController.instance) {
      EducationPricingController.instance = new EducationPricingController();
    }
    return EducationPricingController.instance;
  }
}
