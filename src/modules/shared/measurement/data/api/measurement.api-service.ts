import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { MeasurementEndpoints } from './measurement.api.endpoints';

export default class MeasurementApiService extends BaseApiService {
  private static instance: MeasurementApiService;

  private readonly measurementEndpoints = new MeasurementEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): MeasurementApiService {
    if (!MeasurementApiService.instance) {
      MeasurementApiService.instance = new MeasurementApiService();
    }
    return MeasurementApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.measurementEndpoints.index,
      show: this.measurementEndpoints.show,
      create: this.measurementEndpoints.store,
      update: this.measurementEndpoints.update,
      delete: this.measurementEndpoints.delete,
    };
  }
}
