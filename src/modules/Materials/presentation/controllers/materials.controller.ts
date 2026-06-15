import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import { DataSuccess, type DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type MaterialShowModel from '../../core/models/materials.show.model';
import type MaterialModel from '../../core/models/materials.model';
import MaterialRepository from '../../data/repositories/materials.repository';

export default class MaterialController extends BaseController<
  MaterialShowModel,
  MaterialModel[]
> {
  private static instance: MaterialController;

  protected get repository() {
    return MaterialRepository.getInstance();
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

  static getInstance(): MaterialController {
    if (!MaterialController.instance) {
      MaterialController.instance = new MaterialController();
    }
    return MaterialController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      router.push({ name: 'Material' });
      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      router.push({ name: 'Material' });
      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<MaterialModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  // async fetchOne(params: Params, options?: ApiCallOptions) {
  //   return await super.fetchOne(params, {
  //     ...options,
  //     useJson: true,
  //     headers: {
  //       'Accept-Language': (params as ShowBrandParams).allLocales ? '*' : 'en',
  //     },
  //   });
  // }
}