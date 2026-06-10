import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import type EmployeeModel from '../../core/models/employee.model';

/**
 * Interface for Employee Repository
 */
export default interface IEmployeeRepo {
  index(params?: Params): Promise<DataState<EmployeeModel[]>>;
  show(params: Params): Promise<DataState<EmployeeModel>>;
  create(params: Params): Promise<DataState<EmployeeModel>>;
  update(params: Params): Promise<DataState<EmployeeModel>>;
  delete(params: Params): Promise<DataState<void>>;
}
