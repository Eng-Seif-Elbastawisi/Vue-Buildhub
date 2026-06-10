import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type DeleteAccountsModel from '@/modules/DeleteReasons/core/models/delete.accountes.model';
import DeleteAccountsRepository from '@/modules/DeleteReasons/data/repositories/DeleteAccounts/delete.accounts.repository';

/**
 * Country Controller for managing countries
 *
 * This controller provides methods for CRUD operations on countries.
 */
export default class DletedAccountsController extends BaseController<
  DeleteAccountsModel,
  DeleteAccountsModel[]
> {
  private static instance: DletedAccountsController;

  protected get repository() {
    return DeleteAccountsRepository.getInstance();
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
  static getInstance(): DletedAccountsController {
    if (!DletedAccountsController.instance) {
      DletedAccountsController.instance = new DletedAccountsController();
    }
    return DletedAccountsController.instance;
  }
}
