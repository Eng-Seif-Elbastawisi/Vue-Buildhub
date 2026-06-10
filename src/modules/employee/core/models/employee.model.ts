import { GenderENum } from '../constant/gender.enum';

/**
 * Employee model representing an employee entity
 */
export default class EmployeeModel {
  public readonly id?: number;
  public readonly firstname: string;
  public readonly lastname: string;
  public readonly email: string;
  public readonly phone: string;
  public readonly password?: string;
  public readonly image: string;
  public readonly isSuperadmin: boolean;
  public readonly employeeId: string;
  public readonly status: number;
  public readonly subjects: string;
  public readonly gender: GenderENum;

  get name(): string {
    return `${this.firstname.trim()} ${this.lastname.trim()}`.trim();
  }

  constructor(data: {
    id?: number;
    name?: string;
    firstname?: string;
    lastname?: string;
    email: string;
    phone: string;
    password?: string;
    image: string;
    isSuperadmin: boolean;
    employeeId?: string;
    status: number;
    subjects: string;
    gender?: GenderENum;
  }) {
    this.id = data.id;
    this.firstname = data.firstname || data.name?.split(' ')[0] || '';
    this.lastname = data.lastname || data.name?.split(' ').slice(1).join(' ') || '';
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
    this.image = data.image;
    this.isSuperadmin = data.isSuperadmin;
    this.employeeId = data.employeeId || '';
    this.status = data.status;
    this.subjects = data.subjects;
    this.gender = data.gender as GenderENum;

    Object.freeze(this);
  }

  /**
   * Create EmployeeModel from API response
   * @param json - Raw JSON data from API
   * @returns EmployeeModel instance
   */
  static fromJson(json: any): EmployeeModel {
    if (!json) {
      throw new Error('Cannot create EmployeeModel from null or undefined');
    }

    return new EmployeeModel({
      id: json.id || json.employee_id,
      firstname: json.first_name || json.name?.split(' ')[0] || '',
      lastname: json.last_name || json.name?.split(' ').slice(1).join(' ') || '',
      email: json.email || '',
      phone: json.phone || '',
      password: json.password,
      image: json.image || '',
      isSuperadmin: Boolean(json.isSuperadmin),
      employeeId: json.employee_id || '',
      status: Number(json.status || 0),
      subjects: json.subjects || '',
      gender: json.gender,
    });
  }

  static example: EmployeeModel = new EmployeeModel({
    id: 1,
    firstname: 'John ',
    lastname: 'Doe',
    email: 'john@example.com',
    phone: '123456789',
    image: 'https://cyber.comolho.com/static/img/avatar.png',
    isSuperadmin: false,
    employeeId: 'EMP-545',
    status: 2,
    subjects: 'Maths',
    gender: GenderENum.male,
  });
}
