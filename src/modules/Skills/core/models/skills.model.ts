/**
 * Employee model representing an employee entity
 */
export default class SkillModel {
  public readonly id: number;
  public readonly title: Record<string, string>[] | string;

  constructor(data: { id: number; title: Record<string, string>[] | string }) {
    this.id = data.id;
    this.title = data.title;

    Object.freeze(this);
  }

  /**
   * Create EmployeeModel from API response
   * @param json - Raw JSON data from API
   * @returns EmployeeModel instance
   */
  static fromJson(json: any): SkillModel {
    if (!json) {
      throw new Error('Cannot create EmployeeModel from null or undefined');
    }

    return new SkillModel({
      id: json.skill_id,
      title: json.title,
    });
  }

  static example: SkillModel = new SkillModel({
    id: 1,
    title: [{ name: 'John ' }],
  });
}
