import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type ClientSourceModel from '../../core/models/client.source.model';
import ClientSourceRepository from '../../data/repositories/client.source.repository';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type ShowClientSourceParams from '../../core/params/show.client.source.params';

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
    async fetchOne(params: Params, options?: ApiCallOptions) {
      return await super.fetchOne(params, {
        ...options,
        useJson: true,
        headers: {
          'Accept-Language': (params as ShowClientSourceParams).allLocales ? '*' : 'en',
        },
      });
    }
}
