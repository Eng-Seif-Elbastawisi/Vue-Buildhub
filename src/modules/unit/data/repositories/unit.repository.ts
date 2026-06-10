import BaseRepository, {
  type RepositoryConfig,
} from "@/base/Domain/Repositories/baseRepository";
import TitleInterface from "@/base/Data/Models/titleInterface";
import UnitModel from "../../core/models/unit.model";
import UnitApiService from "../api/unit.api-service";

/**
 * Unit Repository for API data operations
 *
 * This repository handles all data access for unities,
 * including parsing API responses and error handling.
 */
export default class UnitRepository extends BaseRepository<
  UnitModel,
  UnitModel[]
> {
  private static instance: UnitRepository;

  protected get apiService() {
    return UnitApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: "data",
      paginationKey: "meta",
    };
  }

  protected get mockItem(): UnitModel {
    return UnitModel.example;
  }

  protected get mockList(): UnitModel[] {
    return [
      UnitModel.example,
      {
        ...UnitModel.example,
        title: "الوحدة الثانية",
        id: 2,
        Subject: new TitleInterface({
          id: 2,
          title: "الفيزياء",
        }),
      },
      {
        ...UnitModel.example,
        title: "الوحدة الثالثة",
        id: 3,
        Subject: new TitleInterface({
          id: 3,
          title: "الكيمياء",
        }),
      },
    ];
  }

  /**
   * Get singleton instance
   * @returns UnitRepository instance
   */
  static getInstance(): UnitRepository {
    if (!UnitRepository.instance) {
      UnitRepository.instance = new UnitRepository();
    }
    return UnitRepository.instance;
  }

  protected parseItem(data: any): UnitModel {
    return UnitModel.fromJson(data);
  }

  protected parseList(data: any): UnitModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: UnitModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
