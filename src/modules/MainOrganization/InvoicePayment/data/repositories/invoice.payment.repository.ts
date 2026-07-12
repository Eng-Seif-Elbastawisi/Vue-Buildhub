import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import InvoicePaymentModel from '../../core/models/invoice.payment.model';
import InvoicePaymentApiService from '../api/invoice.payment.api-service';

export default class InvoicePaymentRepository extends BaseRepository<
  InvoicePaymentModel,
  InvoicePaymentModel[]
> {
  private static instance: InvoicePaymentRepository;

  protected get apiService() {
    return InvoicePaymentApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): InvoicePaymentModel {
    return InvoicePaymentModel.example;
  }

  protected get mockList(): InvoicePaymentModel[] {
    return [InvoicePaymentModel.example];
  }

  static getInstance(): InvoicePaymentRepository {
    if (!InvoicePaymentRepository.instance) {
      InvoicePaymentRepository.instance = new InvoicePaymentRepository();
    }

    return InvoicePaymentRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): InvoicePaymentModel {
    return InvoicePaymentModel.fromJson(data);
  }

  protected parseList(data: unknown): InvoicePaymentModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => InvoicePaymentModel.fromJson(item));
  }
}
