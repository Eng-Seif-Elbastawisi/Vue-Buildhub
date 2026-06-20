import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import type StageModel from '../../core/models/stage.model';
import { EducationType } from '../../core/constants/educationtype.enum';
import TitleInterface from '@/base/Data/Models/titleInterface';
import MeasurementApiService from '../api/measurement.api-service';
import measurementModel from '../../core/models/stage.model';

/**
 * Country Repository for API data operations
 *
 * This repository handles all data access for countries,
 * including parsing API responses and error handling.
 */
export default class MeasurementRepository extends BaseRepository<StageModel, StageModel[]> {
  private static instance: MeasurementRepository;

  protected get apiService() {
    return MeasurementApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): measurementModel {
    return measurementModel.example;
  }

  protected get mockList(): measurementModel[] {
    return [
      measurementModel.example,
      {
        ...measurementModel.example,
        title: 'المرحلة الإعدادية',
        id: 2,
        EducationType: new TitleInterface({
          id: EducationType.Technical,
          title: 'Technical',
        }),
      },
      {
        ...measurementModel.example,
        title: 'المرحلة الابتدائية',
        id: 3,
        EducationType: new TitleInterface({
          id: EducationType.General,
          title: 'General',
        }),
      },
    ];
  }

  /**
   * Get singleton instance
   * @returns CountryRepository instance
   */
  static getInstance(): MeasurementRepository {
    if (!MeasurementRepository.instance) {
      MeasurementRepository.instance = new MeasurementRepository();
    }
    return MeasurementRepository.instance;
  }

  protected parseItem(data: any): measurementModel {
    return measurementModel.fromJson(data);
  }

  protected parseList(data: any): measurementModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: measurementModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
