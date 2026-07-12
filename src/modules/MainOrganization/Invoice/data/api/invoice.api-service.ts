import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import type { ApiCallOptions, ApiResponse } from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { InvoiceApiEndpoints } from './invoice.api.endpoints';

export default class InvoiceApiService extends BaseApiService {
  private static instance: InvoiceApiService;

  private readonly invoiceEndpoints = new InvoiceApiEndpoints();

  static getInstance(): InvoiceApiService {
    if (!InvoiceApiService.instance) {
      InvoiceApiService.instance = new InvoiceApiService();
    }

    return InvoiceApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.invoiceEndpoints.index,
      show: this.invoiceEndpoints.show,
      create: this.invoiceEndpoints.store,
      update: this.invoiceEndpoints.update,
      delete: this.invoiceEndpoints.delete,
    };
  }

  async exportInvoice(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.customPost<Record<string, unknown>>(this.invoiceEndpoints.export, params, options);
  }
}
