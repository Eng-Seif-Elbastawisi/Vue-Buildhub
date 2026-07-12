import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
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
}
