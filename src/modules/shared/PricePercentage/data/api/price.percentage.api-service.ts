import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { PricePercentageApiEndpoints } from './price.percentage.api.endpoints';

export default class PricePercentageApiService extends BaseApiService {
  private static instance: PricePercentageApiService;

  private readonly pricePercentageEndpoints = new PricePercentageApiEndpoints();

  static getInstance(): PricePercentageApiService {
    if (!PricePercentageApiService.instance) {
      PricePercentageApiService.instance = new PricePercentageApiService();
    }

    return PricePercentageApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      update: this.pricePercentageEndpoints.update,
    };
  }
}
