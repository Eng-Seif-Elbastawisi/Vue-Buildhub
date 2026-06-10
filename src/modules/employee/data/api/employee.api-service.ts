import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { EmployeeEndpoints } from './employee.api.endpoints';

export default class EmployeeApiService extends BaseApiService {
  private static instance: EmployeeApiService;

  private readonly employeeEndpoints = new EmployeeEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): EmployeeApiService {
    if (!EmployeeApiService.instance) {
      EmployeeApiService.instance = new EmployeeApiService();
    }
    return EmployeeApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.employeeEndpoints.index,
      show: this.employeeEndpoints.show,
      create: this.employeeEndpoints.store,
      update: this.employeeEndpoints.update,
      delete: this.employeeEndpoints.delete,
    };
  }
}
