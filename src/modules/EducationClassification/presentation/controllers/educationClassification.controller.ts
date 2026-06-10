import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import EducationClassificationRepository from '../../data/repositories/educationClassification.repository';
import type EducationClassificationModel from '../../core/models/education.classification.model';

/**
 * Education Classification Controller for managing education classifications
 *
 * This controller provides methods for CRUD operations on education classifications.
 */
export default class EducationClassificationController extends BaseController<
  EducationClassificationModel,
  EducationClassificationModel[]
> {
  private static instance: EducationClassificationController;

  protected get repository() {
    return EducationClassificationRepository.getInstance();
  }

  /**
   * Controller configuration
   * Defines behavior for loading, success, and error dialogs
   */
  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: false,
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
  static getInstance(): EducationClassificationController {
    if (!EducationClassificationController.instance) {
      EducationClassificationController.instance = new EducationClassificationController();
    }
    return EducationClassificationController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, { ...options, useJson: true });
    await super.fetchList();
    if (result instanceof DataSuccess) {
      router.push({ name: 'EducationClassifications' });
      if (formKey) {
        FormStore.clearFormData(formKey);
      }
    }
    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions) {
    return super.fetchList(params, { ...options, useJson: true ,headers:{
      'Accept-Language': (params as any).isLocale ? 'ar' : 'en',
    } });
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    // console.log(params, 'params');
    const result = await super.update(params, options);
    await super.fetchList();

    if (result instanceof DataSuccess) {
      router.push({ name: 'EducationClassifications' });
      if (formKey) {
        FormStore.clearFormData(formKey);
      }
    }
    return result;
  }

  async toggleStatus(params: Params) {
    const result = await this.repository.toggleStatus(params);
    return result;
  }
}
