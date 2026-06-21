import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { DepartmentEndpoints } from './department.api.endpoints';

export default class DepartmentApiService extends BaseApiService {
  private static instance: DepartmentApiService;
  private readonly departmentEndpoints = new DepartmentEndpoints();

  static getInstance(): DepartmentApiService {
    if (!DepartmentApiService.instance) DepartmentApiService.instance = new DepartmentApiService();
    return DepartmentApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.departmentEndpoints.index,
      show: this.departmentEndpoints.show,
      create: this.departmentEndpoints.store,
      update: this.departmentEndpoints.update,
      delete: this.departmentEndpoints.delete,
    };
  }
}
