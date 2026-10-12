import { EmployeeType } from '../constants/type.enum';

/**
 * Employee model representing an employee entity
 */
export default class EmployeeModel {
  public readonly id?: number;
  public readonly name: string;
  public readonly email: string;
  public readonly phone: string;
  public readonly password?: string;
  public readonly employee_type?: EmployeeType;

  constructor(data: {
    id?: number;
    name: string;
    email: string;
    phone: string;
    password?: string;
    employee_type?: EmployeeType;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
    this.employee_type = data.employee_type;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): EmployeeModel {
    if (!json) {
      throw new Error('Cannot create EmployeeModel from null or undefined');
    }

    return new EmployeeModel({
      id: Number(json.id ?? json.admin_id),
      name: (json.name as string) || '',
      email: (json.email as string) || '',
      phone: (json.phone as string) || '',
      password: json.password as string | undefined,
      employee_type:
        json.employee_type !== undefined && json.employee_type !== null
          ? (Number(json.employee_type) as EmployeeType)
          : json.type as EmployeeType | undefined,
    });
  }

  static example: EmployeeModel = new EmployeeModel({
    id: 1,
    name: 'Mohamed Saad',
    email: 'mohamed2@example.com',
    phone: '01012345679',
    employee_type: EmployeeType.EMPLOYEE,
  });
}