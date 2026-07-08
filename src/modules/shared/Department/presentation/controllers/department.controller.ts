import BaseController, { type ControllerConfig } from '@/base/Presentation/Controller/baseController';

import type DepartmentModel from '../../core/models/department.model';
import DepartmentRepository from '../../data/repositories/department.repository';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type ShowDepartmentParams from '../../core/params/show.department.params';

export default class DepartmentController extends BaseController<
  DepartmentModel,
  DepartmentModel[]
> {
  private static instance: DepartmentController;

  protected get repository() {
    return DepartmentRepository.getInstance();
  }

  protected get config(): ControllerConfig {
      return {
        showLoadingDialog: false,
        showSuccessDialog: false,
        showErrorDialog: false,
<<<<<<< HEAD
        showErrorTosat: true, 
        showSuccessTosat: true,
        autoRetry: false, 
=======
        showErrorTosat: true,
        showSuccessTosat: true,
        autoRetry: false,
>>>>>>> 391b375 ( add search in sidebar and icon delet)
        maxAutoRetries: 1,
      };
    }

  static getInstance(): DepartmentController {
    if (!DepartmentController.instance) DepartmentController.instance = new DepartmentController();
    return DepartmentController.instance;
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
}
