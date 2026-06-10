import BaseRepository, {
  type RepositoryConfig,
} from "@/base/Domain/Repositories/baseRepository";
import StageModel from "../../core/models/stage.model";
import StageApiService from "../api/stage.api-service";
import { EducationType } from "../../core/constants/educationtype.enum";
import TitleInterface from "@/base/Data/Models/titleInterface";

/**
 * Country Repository for API data operations
 *
 * This repository handles all data access for countries,
 * including parsing API responses and error handling.
 */
export default class StageRepository extends BaseRepository<
  StageModel,
  StageModel[]
> {
  private static instance: StageRepository;

  protected get apiService() {
    return StageApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: "data",
      paginationKey: "meta",
    };
  }

  protected get mockItem(): StageModel {
    return StageModel.example;
  }

  protected get mockList(): StageModel[] {
    return [
      StageModel.example,
      {
        ...StageModel.example,
        title: "المرحلة الإعدادية",
        id: 2,
        EducationType: new TitleInterface({
          id: EducationType.Technical,
          title: "Technical",
        }),
      },
      {
        ...StageModel.example,
        title: "المرحلة الابتدائية",
        id: 3,
        EducationType: new TitleInterface({
          id: EducationType.General,
          title: "General",
        }),
      },
    ];
  }

  /**
   * Get singleton instance
   * @returns CountryRepository instance
   */
  static getInstance(): StageRepository {
    if (!StageRepository.instance) {
      StageRepository.instance = new StageRepository();
    }
    return StageRepository.instance;
  }

  protected parseItem(data: any): StageModel {
    return StageModel.fromJson(data);
  }

  protected parseList(data: any): StageModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: StageModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
