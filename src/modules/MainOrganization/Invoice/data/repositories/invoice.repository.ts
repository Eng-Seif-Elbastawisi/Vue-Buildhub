import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import InvoiceModel from '../../core/models/invoice.model';
import InvoiceApiService from '../api/invoice.api-service';

export default class InvoiceRepository extends BaseRepository<InvoiceModel, InvoiceModel[]> {
  private static instance: InvoiceRepository;

  protected get apiService() {
    return InvoiceApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): InvoiceModel {
    return InvoiceModel.example;
  }

  protected get mockList(): InvoiceModel[] {
    return [InvoiceModel.example];
  }

  static getInstance(): InvoiceRepository {
    if (!InvoiceRepository.instance) {
      InvoiceRepository.instance = new InvoiceRepository();
    }

    return InvoiceRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): InvoiceModel {
    return InvoiceModel.fromJson(data);
  }

  protected parseList(data: unknown): InvoiceModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => InvoiceModel.fromJson(item));
  }
}
