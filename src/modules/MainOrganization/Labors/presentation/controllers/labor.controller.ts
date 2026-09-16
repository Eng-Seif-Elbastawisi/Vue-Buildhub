import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type LaborModel from '../../core/models/labor.model';
import LaborRepository from '../../data/repositories/labor.repository';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';

export default class LaborController extends BaseController<LaborModel, LaborModel[]> {
  private static instance: LaborController;

  protected get repository() {
    return LaborRepository.getInstance();
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

  static getInstance(): LaborController {
    if (!LaborController.instance) {
      LaborController.instance = new LaborController();
    }
    return LaborController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, options);
    if (result instanceof DataSuccess) {
      router.push({ name: 'Labor' });
      if (formKey) {
        FormStore.clearFormData(formKey);
      }
    }
    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.update(params, options);
    if (result instanceof DataSuccess) {
      router.push({ name: 'Labor' });
      if (formKey) {
        FormStore.clearFormData(formKey);
      }
    }
    return result;
  }
}
