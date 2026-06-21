import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for adding a new employee
 */
export default class AddEmployeeParams implements Params {
  public name: string;
  public email: string;
  public phone: string;
  public password: string;

  public static readonly validation = new ClassValidation().setRules({
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { required: true },
    phone: { required: true },
    password: { required: true, minLength: 6 },
  });

  constructor(data: { name: string; email: string; phone: string; password: string }) {
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
  }

  toMap(): { [p: string]: any } {
    return {
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
    };
  }

  validate() {
    return AddEmployeeParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddEmployeeParams.validation.validateOrThrow(this);
  }
}
