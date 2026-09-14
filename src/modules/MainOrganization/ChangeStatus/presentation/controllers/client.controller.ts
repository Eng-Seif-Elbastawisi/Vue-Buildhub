import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import type ClientModel from '../../core/models/client.model';
import ClientRepository from '../../data/repositories/change_status.repository';

export default class ChangeStatusController extends BaseController<ClientModel, ClientModel> {
  private static instance: ChangeStatusController;

  protected get repository(): ClientRepository {
    return ClientRepository.getInstance();
  }

  static getInstance(): ChangeStatusController {
    if (!ChangeStatusController.instance) {
      ChangeStatusController.instance = new ChangeStatusController();
    }
    return ChangeStatusController.instance;
  }

  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: true,
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



  async changeStatus(params: Params) {
    
    await this.repository.changeStatus(params);
  }
}
