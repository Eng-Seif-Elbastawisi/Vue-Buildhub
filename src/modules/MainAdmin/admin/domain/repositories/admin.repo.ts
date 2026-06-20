import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import type AdminModel from '../../core/models/admin.model';

/**
 * Interface for Admin Repository
 */
export default interface IAdminRepo {
  index(params?: Params): Promise<DataState<AdminModel[]>>;
  show(params: Params): Promise<DataState<AdminModel>>;
  create(params: Params): Promise<DataState<AdminModel>>;
  update(params: Params): Promise<DataState<AdminModel>>;
  delete(params: Params): Promise<DataState<void>>;
}
