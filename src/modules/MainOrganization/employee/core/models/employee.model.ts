/**
 * Admin model representing an admin entity
 */
export default class EmployeeModel {
  public readonly id?: number;
  public readonly name: string;
  public readonly email: string;
  public readonly phone: string;
  public readonly password?: string;

  constructor(data: {
    id?: number;
    name: string;
    email: string;
    phone: string;
    password?: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;

    Object.freeze(this);
  }

  /**
   * Create AdminModel from API response
   * @param json - Raw JSON data from API
   * @returns AdminModel instance
   */
  static fromJson(json: any): EmployeeModel {
    if (!json) {
      throw new Error('Cannot create AdminModel from null or undefined');
    }

    return new EmployeeModel({
      id: json.id || json.admin_id,
      name: json.name || '',
      email: json.email || '',
      phone: json.phone || '',
      password: json.password,
    });
  }

  static example: EmployeeModel = new EmployeeModel({
    id: 1,
    name: 'Mohamed Saad',
    email: 'mohamed2@example.com',
    phone: '01012345679',
  });
}
