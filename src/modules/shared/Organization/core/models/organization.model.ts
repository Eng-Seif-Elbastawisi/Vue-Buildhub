export default class OrganizationModel {
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

  static fromJson(json: any): OrganizationModel {
    if (!json) {
      throw new Error('Cannot create OrganizationModel from null or undefined');
    }

    return new OrganizationModel({
      id: json.id,
      employee_name: json.employee_name,
      employee_email: json.employee_email,
      employee_phone: json.employee_phone,
      employee_password: json.employee_password,
      address: json.address,
      name: json.name,
    });
  }

  static example: OrganizationModel = new OrganizationModel({
    id: 10,
    employee_name: 'John',
    employee_email: ' [EMAIL_ADDRESS] ',
    employee_phone: '01112',
    employee_password: 'password',
    address: '123 Main St',
    name: 'John Doe',
  });
}
