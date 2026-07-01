export default class OrganizationEmployeeModel {
  public readonly id?: number;
  public readonly employee_name: string;
  public readonly employee_email: string;
  public readonly employee_phone: string;
  public readonly employee_password: string;
  public readonly address: string;
  public readonly name: string;

  constructor(data: {
    id?: number;
    employee_name: string;
    employee_email: string;
    employee_phone: string;
    employee_password: string;
    address: string;
    name: string;
  }) {
    this.id = data.id;
    this.employee_name = data.employee_name;
    this.employee_email = data.employee_email;
    this.employee_phone = data.employee_phone;
    this.employee_password = data.employee_password;
    this.address = data.address;
    this.name = data.name;

    Object.freeze(this);
  }

  static fromJson(json: any): OrganizationEmployeeModel {
    if (!json) {
      throw new Error('Cannot create OrganizationEmployeeModel from null or undefined');
    }

    return new OrganizationEmployeeModel({
      id: json.id,
      employee_name: json.name,
      employee_email: json.email,
      employee_phone: json.phone,
      employee_password: json.password,
      address: json.address,
      name: json.name,
    });
  }

  static example: OrganizationEmployeeModel = new OrganizationEmployeeModel({
    id: 10,
    employee_name: 'John',
    employee_email: ' [EMAIL_ADDRESS] ',
    employee_phone: '01112',
    employee_password: 'password',
    address: '123 Main St',
    name: 'John Doe',
  });
}
