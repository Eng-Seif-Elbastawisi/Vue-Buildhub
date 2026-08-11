import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type DepartmentModel from '../../core/models/department.model';
import type DepartmentShowModel from '../../core/models/department.model';
import DepartmentRepository from '../../data/repositories/department.repository';
import { useUserStore } from '@/stores/user';
import type ShowDepartmentParams from '../../core/params/show.department.params';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';

export default class DepartmentController extends BaseController<
  DepartmentShowModel,
  DepartmentModel[]
> {
  private static instance: DepartmentController;

  private get userStore() {
    return useUserStore();
  }
  protected get repository() {
    return DepartmentRepository.getInstance();
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
  static getInstance(): DepartmentController {
    if (!DepartmentController.instance) DepartmentController.instance = new DepartmentController();
    return DepartmentController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
      // router.push(
      //   this.userStore.user?.type === 1 ? '/mainportal/department' : '/organization/department',
      // );

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
      // router.push(
      //   this.userStore.user?.type === 1 ? '/mainportal/department' : '/organization/department',
      // );

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<DepartmentModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowDepartmentParams).allLocales ? '*' : 'en',
      },
    });
  }
  async delete(params: Params, options?: ApiCallOptions) {
    const result = await super.delete(params, {
      ...options,
      useJson: true,
    });

    if (!(result instanceof DataSuccess)) {
      const response = result as any;

      const errorMessage =
        response?.message ??
        response?.error?.displayMessage ??
        response?.error?.message ??
        response?.error?.title ??
        response?.data?.message ??
        response?.response?.data?.message ??
        'حدث خطأ أثناء حذف القسم.';

      dialogManager.toastError(errorMessage);
    }

    return result;
  }
}
