import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import { DataSuccess, type DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type SuppliersShowModel from '../../core/models/Suppliers.show.model';
import type ShowSuppliersParams from '../../core/params/show.Suppliers.params';
import type SuppliersModel from '../../core/models/Suppliers.model';
import SuppliersRepository from '../../data/repositories/Suppliers.repository';

export default class SuppliersController extends BaseController<
  SuppliersShowModel,
  SuppliersModel[]
> {
  private static instance: SuppliersController;

  protected get repository() {
    return SuppliersRepository.getInstance();
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

  static getInstance(): SuppliersController {
    if (!SuppliersController.instance) {
      SuppliersController.instance = new SuppliersController();
    }
    return SuppliersController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      router.push({ name: 'Suppliers' });
      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      router.push({ name: 'Suppliers' });
      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<SuppliersModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowSuppliersParams).allLocales ? '*' : 'en',
      },
    });
  }
}