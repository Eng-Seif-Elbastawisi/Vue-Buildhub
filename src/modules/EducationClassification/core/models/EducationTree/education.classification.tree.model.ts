import BranchesModel from './branches.model';

/**
 * Country model representing a nation's geographical and cultural data
 */
export default class EducationClassificationTreeModel {
  public readonly id: number;
  public readonly number_of_branches: number;
  public readonly branches: BranchesModel[];

  constructor(data: { id: number; number_of_branches: number; branches: BranchesModel[] }) {
    this.id = data.id;
    this.number_of_branches = data.number_of_branches;
    this.branches = data.branches;

    Object.freeze(this);
  }

  /**
   * Create CountryModel from API response
   * @param json - Raw JSON data from API
   * @returns CountryModel instance
   */
  static fromJson(json: Record<string, unknown>): EducationClassificationTreeModel {
    if (!json) {
      throw new Error('Cannot create EducationClassificationTreeModel from null or undefined');
    }

    return new EducationClassificationTreeModel({
      id: json.id as number,
      number_of_branches: json.number_of_branches as number,
      branches: (json.branches as Record<string, unknown>[]).map((el: Record<string, unknown>) =>
        BranchesModel.fromJson(el),
      ),
    });
  }

  static example: EducationClassificationTreeModel = new EducationClassificationTreeModel({
    id: 1,
    number_of_branches: 4,
    branches: [BranchesModel.example],
  });
}
