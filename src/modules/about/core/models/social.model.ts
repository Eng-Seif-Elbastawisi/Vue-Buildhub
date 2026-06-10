/**
 * Employee model representing an employee entity
 */
export default class SocialModel {
  public readonly id?: number;
  public readonly link?: string;
  public readonly icon?: string;

  constructor(data: { id?: number; link?: string; icon?: string }) {
    this.id = data.id;
    this.link = data.link;
    this.icon = data.icon;

    Object.freeze(this);
  }

  /**
   * Create EmployeeModel from API response
   * @param json - Raw JSON data from API
   * @returns EmployeeModel instance
   */
  static fromJson(json: any): SocialModel {
    if (!json) {
      throw new Error('Cannot create EmployeeModel from null or undefined');
    }

    return new SocialModel({
      id: json.id,
      link: json.link,
      icon: json.icon,
    });
  }

  static example: SocialModel = new SocialModel({
    icon: '',
    link: '',
  });
}
