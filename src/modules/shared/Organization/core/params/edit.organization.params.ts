import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class EditOrganizationParams implements Params {
  public organization_id?: number;
  public employee_name?: string;
  public employee_email?: string;
  public employee_phone?: string;
  public employee_password?: string;
  public address?: string;
  public name?: string;
  public logo?: string;

  public static readonly validation = new ClassValidation().setRules({
    organization_id: { required: true },
    employee_name: { required: false },
    employee_email: { required: false },
    employee_phone: { required: false },
    employee_password: { required: false },
    address: { required: false },
    name: { required: false },
    logo: { required: false },
  });

  constructor(data: {
    organization_id?: number;
    employee_name?: string;
    employee_email?: string;
    employee_phone?: string;
    employee_password?: string;
    address?: string;
    name?: string;
    logo?: string;
  }) {
    this.organization_id = data.organization_id;
    this.employee_name = data.employee_name;
    this.employee_email = data.employee_email;
    this.employee_phone = data.employee_phone;
    this.employee_password = data.employee_password;
    this.address = data.address;
    this.name = data.name;
    this.logo = data.logo;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      organization_id: this.organization_id,
      employee_name: this.employee_name,
      employee_email: this.employee_email,
      employee_phone: this.employee_phone,
      employee_password: this.employee_password,
      address: this.address,
      name: this.name,
      logo: this.logo,
    };

    return map;
  }

  validate() {
    return EditOrganizationParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditOrganizationParams.validation.validateOrThrow(this);
  }
}
