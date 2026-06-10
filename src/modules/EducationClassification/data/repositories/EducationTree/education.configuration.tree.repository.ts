import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import EducationClassificationTreeModel from '@/modules/EducationClassification/core/models/EducationTree/education.classification.tree.model';
import EducationTreeApiService from '../../api/EducationTree/education.configuration.tree.api-service';
import BranchesModel from '@/modules/EducationClassification/core/models/EducationTree/branches.model';

/**
 * Education Tree Repository for API data operations
 *
 * This repository handles all data access for education trees,
 * including parsing API responses and error handling.
 */
export default class EducationTreeRepository extends BaseRepository<
  EducationClassificationTreeModel,
  EducationClassificationTreeModel[]
> {
  private static instance: EducationTreeRepository;

  protected get apiService() {
    return EducationTreeApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): EducationClassificationTreeModel {
    return EducationClassificationTreeModel.example;
  }

  protected get mockList(): EducationClassificationTreeModel[] {
    return [
      new EducationClassificationTreeModel({
        number_of_branches: 3,
        id: 1,
        branches: [
          new BranchesModel({
            branch_id: 2,
            branch_title: 'حكومي',
            branches: [
              new BranchesModel({
                branch_title: 'ابتدائي',
                branch_id: 3,
                branches: [
                  new BranchesModel({
                    branch_title: 'اولى',
                    branch_id: 6,
                    branches: [
                      new BranchesModel({
                        branch_title: 'عربي',
                        branch_id: 12,
                        branches: [],
                      }),
                      new BranchesModel({
                        branch_title: 'رياضيات',
                        branch_id: 13,
                        branches: [],
                      }),
                      new BranchesModel({
                        branch_title: 'علوم',
                        branch_id: 14,
                        branches: [],
                      }),
                      new BranchesModel({
                        branch_title: 'دراسات اجتماعية',
                        branch_id: 15,
                        branches: [],
                      }),
                      new BranchesModel({
                        branch_title: 'لغة انجليزية',
                        branch_id: 16,
                        branches: [],
                      }),
                      new BranchesModel({
                        branch_title: 'تربية اسلامية',
                        branch_id: 17,
                        branches: [],
                      }),
                    ],
                  }),
                  new BranchesModel({
                    branch_title: 'ثانية',
                    branch_id: 7,
                    branches: [],
                  }),
                  new BranchesModel({
                    branch_title: 'ثالثة',
                    branch_id: 8,
                    branches: [],
                  }),
                  new BranchesModel({
                    branch_title: 'رابعة',
                    branch_id: 9,
                    branches: [],
                  }),
                  new BranchesModel({
                    branch_title: 'خامسة',
                    branch_id: 10,
                    branches: [],
                  }),
                  new BranchesModel({
                    branch_title: 'سادسة',
                    branch_id: 11,
                    branches: [],
                  }),
                ],
              }),
              new BranchesModel({
                branch_title: 'اعدادي',
                branch_id: 4,
                branches: [],
              }),
              new BranchesModel({
                branch_title: 'ثانوي',
                branch_id: 5,
                branches: [],
              }),
            ],
          }),
        ],
      }),
    ];
  }

  /**
   * Get singleton instance
   * @returns EducationTreeRepository instance
   */
  static getInstance(): EducationTreeRepository {
    if (!EducationTreeRepository.instance) {
      EducationTreeRepository.instance = new EducationTreeRepository();
    }
    return EducationTreeRepository.instance;
  }

  protected parseItem(data: unknown): EducationClassificationTreeModel {
    return EducationClassificationTreeModel.fromJson(data as Record<string, unknown>);
  }

  protected parseList(data: unknown): EducationClassificationTreeModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: EducationClassificationTreeModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
