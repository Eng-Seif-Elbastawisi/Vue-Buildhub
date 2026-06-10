/**
 * Country model representing a nation's geographical and cultural data
 */
export default class BranchesModel {
  public readonly branch_id: number;
  public readonly branch_title: string;
  public readonly branches: BranchesModel[];

  constructor(data: { branch_id: number; branch_title: string; branches: BranchesModel[] }) {
    this.branch_id = data.branch_id;
    this.branch_title = data.branch_title;
    this.branches = data.branches;

    Object.freeze(this);
  }

  /**
   * Create CountryModel from API response
   * @param json - Raw JSON data from API
   * @returns CountryModel instance
   */
  static fromJson(json: Record<string, unknown>): BranchesModel {
    if (!json) {
      throw new Error('Cannot create BranchesModel from null or undefined');
    }

    return new BranchesModel({
      branch_id: json.branch_id as number,
      branch_title: json.branch_title as string,
      branches: (json.branches as Record<string, unknown>[]).map((el) =>
        BranchesModel.fromJson(el),
      ),
    });
  }

  static example: BranchesModel = new BranchesModel({
    branch_id: 1,
    branch_title: 'Basic education',
    branches: [
      new BranchesModel({
        branch_id: 1,
        branch_title: 'branch',
        branches: [],
      }),
    ],
  });
}
