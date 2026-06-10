import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import EducationClassificationApiService from '../api/educationClassification.api-service';
import EducationClassificationModel from '../../core/models/education.classification.model';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';

/**
 * Education Classification Repository for API data operations
 *
 * This repository handles all data access for education classifications,
 * including parsing API responses and error handling.
 */
export default class EducationClassificationRepository extends BaseRepository<
  EducationClassificationModel,
  EducationClassificationModel[]
> {
  private static instance: EducationClassificationRepository;

  protected get apiService() {
    return EducationClassificationApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): EducationClassificationModel {
    return EducationClassificationModel.example;
  }

  protected get mockList(): EducationClassificationModel[] {
    return [
      { ...EducationClassificationModel.example },
      {
        ...EducationClassificationModel.example,
        title: 'Secondary education',
        id: 2,
        status: false,
        has_configuration: false,
      },
    ];
  }

  /**
   * Get singleton instance
   * @returns EducationClassificationRepository instance
   */
  static getInstance(): EducationClassificationRepository {
    if (!EducationClassificationRepository.instance) {
      EducationClassificationRepository.instance = new EducationClassificationRepository();
    }
    return EducationClassificationRepository.instance;
  }

  protected parseItem(data: unknown): EducationClassificationModel {
    // console.log(data);
    return EducationClassificationModel.fromJson(data as Record<string, unknown>);
  }

  protected parseList(data: unknown): EducationClassificationModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: EducationClassificationModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }

  async toggleStatus(params: Params): Promise<DataState<EducationClassificationModel>> {
    return this.executeCustom(
      () => this.apiService.toggleStatus(params),
      (data) => this.parseItem(data),
    );
  }
}
