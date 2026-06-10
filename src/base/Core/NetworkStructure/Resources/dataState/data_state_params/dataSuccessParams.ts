import type PaginationModel from "@/base/Core/Models/paginationModel";

export default interface DataSuccessParams<T> {
  data?: T | null;
  searchData?: T | null;
  pagination?: PaginationModel | null;
  message?: string | null;
}
