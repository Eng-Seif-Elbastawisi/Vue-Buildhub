import type TitleInterface from '@/base/Data/Models/titleInterface';

/**
 * Country model representing a nation's geographical and cultural data
 */
export default class BranchesModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly subjects: TitleInterface<string>[];
  public readonly e_c_branch_id?: number;
  public readonly parent_id?: number;
  public readonly children?: BranchesModel[];

  constructor(data: {
    id?: number;
    title: string;
    subjects: TitleInterface<string>[];
    e_c_branch_id?: number;
    parent_id?: number;
    children?: BranchesModel[];
  }) {
    this.id = data.id;
    this.title = data.title;
    this.subjects = data.subjects;
    this.e_c_branch_id = data.e_c_branch_id;
    this.parent_id = data.parent_id;
    this.children = data.children;
    Object.freeze(this);
  }

  /**
   * Create CountryModel from API response
   * @param json - Raw JSON data from API
   * @returns CountryModel instance
   */
  static fromJson(json: any): BranchesModel {
    if (!json) {
      throw new Error('Cannot create CountryModel from null or undefined');
    }

    return new BranchesModel({
      id: json.id,
      title: json.title,
      subjects: json.subjects,
      e_c_branch_id: json.e_c_branch_id,
      parent_id: json.parent_id,
      children: json.children
        ? json.children.map((child: any) => BranchesModel.fromJson(child))
        : undefined,
    });
  }

  static example: BranchesModel = new BranchesModel({
    id: 1,
    title: 'المرحلة الثانوية',
    subjects: [
      { id: 1, title: 'درس1' },
      { id: 2, title: 'درس2' },
    ],
    children: [
      {
        id: 2,
        title: 'المرحلة الاعدادية',
        subjects: [
          { id: 1, title: 'درس1' },
          { id: 2, title: 'درس2' },
        ],
      },
    ],
  });
}
