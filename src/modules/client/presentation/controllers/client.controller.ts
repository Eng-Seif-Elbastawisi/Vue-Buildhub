import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import {
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type ClientShowModel from '../../core/models/client.show.model';
import type ClientModel from '../../core/models/client.model';
import type ShowClientParams from '../../core/params/show.client.params';
import ClientRepository from '../../data/repositories/client.repository';

export default class ClientController extends BaseController<ClientShowModel, ClientModel[]> {
  private static instance: ClientController;

  protected get repository() {
    return ClientRepository.getInstance();
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

  static getInstance(): ClientController {
    if (!ClientController.instance) {
      ClientController.instance = new ClientController();
    }
    return ClientController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      router.push({ name: 'Client' });
      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      router.push({ name: 'Client' });
      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<ClientModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowClientParams).allLocales ? '*' : 'en',
      },
    });
  }
}
