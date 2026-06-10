import BaseRepository, {
  type RepositoryConfig,
} from "@/base/Domain/Repositories/baseRepository";
import TermsConditionsModel from "../../core/models/terms-conditions.model";
import TermsConditionsApiService from "../api/terms-conditions.api-service";

/**
 * Country Repository for API data operations
 *
 * This repository handles all data access for countries,
 * including parsing API responses and error handling.
 */
export default class TermsConditionsRepository extends BaseRepository<
  TermsConditionsModel,
  TermsConditionsModel[]
> {
  private static instance: TermsConditionsRepository;

  protected get apiService() {
    return TermsConditionsApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: "data",
      paginationKey: "meta",
    };
  }

  protected get mockItem(): TermsConditionsModel {
    return TermsConditionsModel.example;
  }

  protected get mockList(): TermsConditionsModel[] {
    return [TermsConditionsModel.example, TermsConditionsModel.example];
  }

  /**
   * Get singleton instance
   * @returns CountryRepository instance
   */
  static getInstance(): TermsConditionsRepository {
    if (!TermsConditionsRepository.instance) {
      TermsConditionsRepository.instance = new TermsConditionsRepository();
    }
    return TermsConditionsRepository.instance;
  }

  protected parseItem(data: any): TermsConditionsModel {
    return TermsConditionsModel.fromJson(data);
  }

  protected parseList(data: any): TermsConditionsModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: TermsConditionsModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
