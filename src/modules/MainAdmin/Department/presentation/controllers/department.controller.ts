import BaseController from '@/base/Presentation/Controller/baseController';

import type DepartmentModel from '../../core/models/department.model';
import DepartmentRepository from '../../data/repositories/department.repository';

export default class DepartmentController extends BaseController<
  DepartmentModel,
  DepartmentModel[]
> {
  private static instance: DepartmentController;

  protected get repository() {
    return DepartmentRepository.getInstance();
  }

  private constructor() {
    super();
  }

  static getInstance(): DepartmentController {
    if (!DepartmentController.instance) DepartmentController.instance = new DepartmentController();
    return DepartmentController.instance;
  }
}
