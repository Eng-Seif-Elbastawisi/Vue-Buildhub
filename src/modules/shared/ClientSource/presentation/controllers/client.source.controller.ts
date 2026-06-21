import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type ClientSourceModel from '../../core/models/client.source.model';
import ClientSourceRepository from '../../data/repositories/client.source.repository';

export default class ClientSourceController extends BaseController<ClientSourceModel, ClientSourceModel[]> {
  private static instance: ClientSourceController;

  protected get repository() {
    return ClientSourceRepository.getInstance();
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

  static getInstance(): ClientSourceController {
    if (!ClientSourceController.instance) {
      ClientSourceController.instance = new ClientSourceController();
    }
    return ClientSourceController.instance;
  }
}
