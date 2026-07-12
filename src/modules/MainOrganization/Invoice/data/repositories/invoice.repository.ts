import { HttpStatusCode } from 'axios';
import {
  DataFailed,
  type DataState,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import { env } from '@/base/Core/Config';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import InvoiceModel from '../../core/models/invoice.model';
import InvoiceShowModel from '../../core/models/invoice.show.model';
import type ExportInvoiceParams from '../../core/params/export.invoice.params';
import InvoiceApiService from '../api/invoice.api-service';

export default class InvoiceRepository extends BaseRepository<InvoiceShowModel, InvoiceModel[]> {
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

  protected get mockItem(): InvoiceShowModel {
    return InvoiceShowModel.example;
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

  protected parseItem(data: Record<string, unknown>): InvoiceShowModel {
    return InvoiceShowModel.fromJson(data);
  }

  protected parseList(data: unknown): InvoiceModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => InvoiceModel.fromJson(item));
  }

  async exportInvoice(
    params: ExportInvoiceParams,
    options?: ApiCallOptions,
  ): Promise<DataState<Record<string, unknown>>> {
    if (options?.useStaticData ?? env.useStaticData) {
      return new DataSuccess<Record<string, unknown>>({
        data: params.toMap(),
        message: 'Invoice exported successfully',
      });
    }

    const retryFn = () => this.exportInvoice(params, options);

    try {
      const httpResponse = await this.apiService.exportInvoice(params, options);
      const responseData = httpResponse.data as {
        status?: boolean;
        message?: string;
        data?: unknown;
      };
      const isSuccess =
        [HttpStatusCode.Ok, HttpStatusCode.Created, HttpStatusCode.Accepted].includes(
          httpResponse.statusCode,
        ) &&
        (responseData.status ?? true);

      if (isSuccess) {
        const data =
          responseData.data && typeof responseData.data === 'object'
            ? (responseData.data as Record<string, unknown>)
            : {};

        return new DataSuccess<Record<string, unknown>>({
          data,
          message: responseData.message,
        });
      }

      return new DataFailed({
        error: new ErrorModel(responseData.message ?? 'Unknown error', ErrorType.serviceSide),
      });
    } catch (error) {
      return this.handleError(error, retryFn);
    }
  }
}
