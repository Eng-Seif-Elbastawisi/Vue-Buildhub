import BaseRepository, {
  type RepositoryConfig,
} from "@/base/Domain/Repositories/baseRepository";
import PrivacyModel from "../../core/models/privacy.model";
import PrivacyApiService from "../api/privacy.api-service";

/**
 * Country Repository for API data operations
 *
 * This repository handles all data access for countries,
 * including parsing API responses and error handling.
 */
export default class PrivacyRepository extends BaseRepository<
  PrivacyModel,
  PrivacyModel[]
> {
  private static instance: PrivacyRepository;

  protected get apiService() {
    return PrivacyApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: "data",
      paginationKey: "meta",
    };
  }

  protected get mockItem(): PrivacyModel {
    return PrivacyModel.example;
  }

  protected get mockList(): PrivacyModel[] {
    return [PrivacyModel.example, PrivacyModel.example];
  }

  /**
   * Get singleton instance
   * @returns CountryRepository instance
   */
  static getInstance(): PrivacyRepository {
    if (!PrivacyRepository.instance) {
      PrivacyRepository.instance = new PrivacyRepository();
    }
    return PrivacyRepository.instance;
  }

  protected parseItem(data: any): PrivacyModel {
    return PrivacyModel.fromJson(data);
  }

  protected parseList(data: any): PrivacyModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: PrivacyModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
