import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type EmployeeType } from '../constants/type.enum';
/**
 * Parameters for editing an employee
 */
export default class EditEmployeeParams implements Params {
  public id: number;
  public name: string;
  public email: string;
  public phone: string;
  public password?: string;
  public type?: EmployeeType;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { required: true },
    phone: { required: true },
    password: { required: false, minLength: 6 },
    type: { required: false },
  });

  constructor(data: {
    id: number;
    name: string;
    email: string;
    phone: string;
    password?: string;
    type?: EmployeeType;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
    this.type = data.type;
  }

  toMap(): { [p: string]: any } {
    return {
      employee_id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      type: this.type,
    };
  }

  validate() {
    return EditEmployeeParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditEmployeeParams.validation.validateOrThrow(this);
  }
}
