import { type ErrorModel } from '../../errors/errorModel';
import type ValidationModel from '../../validations/validationModel';
import type PaginationModel from '@/base/Core/Models/paginationModel';
interface Data_state_params<T> {
  data?: T | null;
  searchData?: T | null;
  error?: ErrorModel | null;
  pagination?: PaginationModel | null;
  message?: string | null;
  validation?: ValidationModel | null;
}

interface DataSuccessParams<T> {
  data?: T | null;
  searchData?: T | null;
  pagination?: PaginationModel | null;
  message?: string | null;
}

interface DataFailedParams {
  error?: ErrorModel | null;
}

interface DataInitialParams<T> {
  data?: T | null;
}

export type { Data_state_params, DataSuccessParams, DataFailedParams, DataInitialParams };
