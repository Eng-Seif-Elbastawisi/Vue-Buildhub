import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';

import EducationPricingModel from '@/modules/EducationClassification/core/models/EducationPricing/education.pricing.model';
import EducationPricingApiService from '@/modules/EducationClassification/data/api/EducationPricing/education.pricing.api-service';

/**
 * Education Pricing Repository for API data operations
 *
 * This repository handles all data access for education pricing,
 * including parsing API responses and error handling.
 */
export default class EducationPricingRepository extends BaseRepository<
  EducationPricingModel,
  EducationPricingModel[]
> {
  private static instance: EducationPricingRepository;

  protected get apiService() {
    return EducationPricingApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): EducationPricingModel {
    return EducationPricingModel.example;
  }

  protected get mockList(): EducationPricingModel[] {
    return [{ ...EducationPricingModel.example }];
  }

  /**
   * Get singleton instance
   * @returns EducationPricingRepository instance
   */
  static getInstance(): EducationPricingRepository {
    if (!EducationPricingRepository.instance) {
      EducationPricingRepository.instance = new EducationPricingRepository();
    }
    return EducationPricingRepository.instance;
  }

  protected parseItem(data: unknown): EducationPricingModel {
    // console.log(data);
    return EducationPricingModel.fromJson(data as Record<string, unknown>);
  }

  protected parseList(data: unknown): EducationPricingModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: EducationPricingModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
