import type TitleInterface from '@/base/Data/Models/titleInterface';
import OrganizationEmployeeModel from './employee.model';
export default class OrganizationShowModel {
  public readonly id?: number;
  public readonly phone?: string;
  public readonly employee_name?: string;
  public readonly employee_email?: string;
  public readonly employee_phone?: string;
  public readonly employee_password?: string;
  public readonly address?: string;
  public readonly name?: string;
  public readonly default_employee: OrganizationEmployeeModel;

  constructor(data: {
    id?: number;
    phone?: string;
    employee_name?: string;
    employee_email?: string;
    employee_phone?: string;
    employee_password?: string;
    address?: string;
    name?: string;
    default_employee: OrganizationEmployeeModel;
  }) {
    this.id = data.id;
    this.phone = data.phone;
    this.employee_name = data.employee_name;
    this.employee_email = data.employee_email;
    this.employee_phone = data.employee_phone;
    this.employee_password = data.employee_password;
    this.address = data.address;
    this.name = data.name;
    this.default_employee = data.default_employee;
    Object.freeze(this);
  }

  static mapTranslations = (translations: any[], key: string = 'value') => {
    const result: Record<string, string> = {};
    if (Array.isArray(translations)) {
      translations.forEach((t: any) => {
        if (t.locale && t[key]) {
          result[t.locale] = t[key];
        }
      });
    }
    return result;
  };

  static fromJson(json: any): OrganizationShowModel {
    if (!json) throw new Error('Invalid OrganizationShowModel data');

    return new OrganizationShowModel({
      id: json.id,
      phone: json.phone,
      employee_name: json.employee_name,
      employee_email: json.employee_email,
      employee_phone: json.employee_phone,
      employee_password: json.employee_password,
      address: json.address,
      default_employee: OrganizationEmployeeModel.fromJson(json.default_employee),
      name: json.name,
    });
  }

  static example: OrganizationShowModel = new OrganizationShowModel({
    id: 1,
    phone: '+966 50 123 4567',
    employee_name: 'Steel, Cement, Bricks',
    employee_email: 'ABC Suppliers Ltd',
    employee_phone: 'General Building Materials',
    employee_password: 'General Building Materials',
    address: 'General Building Materials',
    name: 'General Building Materials',
    default_employee: OrganizationEmployeeModel.example,
  });

  static getLocalizedData<T extends Record<string, any>>(
    obj: T,
    locale: string,
  ): TitleInterface<number> {
    const result: TitleInterface<number> = {
      /*  */ id: obj.id,
    };

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (Array.isArray(value)) {
        const localizedItem = value.find((item) => item.locale === locale);

        if (localizedItem) {
          const { locale: _, ...rest } = localizedItem;

          Object.assign(result, rest);
        }
      }
    });

    return result;
  }
}
