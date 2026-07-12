import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { InvoicePaymentApiEndpoints } from './invoice.payment.api.endpoints';

export default class InvoicePaymentApiService extends BaseApiService {
  private static instance: InvoicePaymentApiService;

  private readonly invoicePaymentEndpoints = new InvoicePaymentApiEndpoints();

  static getInstance(): InvoicePaymentApiService {
    if (!InvoicePaymentApiService.instance) {
      InvoicePaymentApiService.instance = new InvoicePaymentApiService();
    }

    return InvoicePaymentApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.invoicePaymentEndpoints.index,
      show: this.invoicePaymentEndpoints.show,
      create: this.invoicePaymentEndpoints.store,
      update: this.invoicePaymentEndpoints.update,
      delete: this.invoicePaymentEndpoints.delete,
    };
  }
}
