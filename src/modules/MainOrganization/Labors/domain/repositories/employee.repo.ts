import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import type LaborModel from '../../core/models/labor.model';

/**
 * Interface for Employee Repository
 */
export default interface IEmployeeRepo {
  index(params?: Params): Promise<DataState<LaborModel[]>>;
  show(params: Params): Promise<DataState<LaborModel>>;
  create(params: Params): Promise<DataState<LaborModel>>;
  update(params: Params): Promise<DataState<LaborModel>>;
  delete(params: Params): Promise<DataState<void>>;
}
