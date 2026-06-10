import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type DeleteResonsModel from '../../core/models/delete.reasons.model';
import DeleteReasonesRepository from '../../data/repositories/delete.reasons.repository';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

/**
 * Country Controller for managing countries
 *
 * This controller provides methods for CRUD operations on countries.
 */
export default class DeletedReasonsController extends BaseController<
  DeleteResonsModel,
  DeleteResonsModel[]
> {
  private static instance: DeletedReasonsController;

  protected get repository() {
    return DeleteReasonesRepository.getInstance();
  }

  /**
   * Controller configuration
   * Defines behavior for loading, success, and error dialogs
   */
  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: false,
      showSuccessDialog: false,
      showErrorDialog: false,
      autoRetry: false,
      showErrorTosat: true,
      showSuccessTosat: true,
      maxAutoRetries: 0,
    };
  }

  private constructor() {
    super();
  }

  /**
   * Get singleton instance
   * @returns CountryController instance
   */
  static getInstance(): DeletedReasonsController {
    if (!DeletedReasonsController.instance) {
      DeletedReasonsController.instance = new DeletedReasonsController();
    }
    return DeletedReasonsController.instance;
  }

  async create(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<DeleteResonsModel> | undefined> {
    return await super.create(params, { ...options, useJson: true });
  }
}
