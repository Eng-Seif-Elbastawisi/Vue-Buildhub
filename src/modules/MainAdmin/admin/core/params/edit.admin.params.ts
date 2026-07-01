import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for editing an admin
 */
export default class EditAdminParams implements Params {
  public id: number;
  public name: string;
  public email: string;
  public phone: string;
  public password?: string;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { required: true },
    phone: { required: true },
    password: { required: false, minLength: 6 },
  });

  constructor(data: { id: number; name: string; email: string; phone: string; password?: string }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
  }

  toMap(): { [p: string]: any } {
    return {
      admin_id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
    };
  }

  validate() {
    return EditAdminParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditAdminParams.validation.validateOrThrow(this);
  }
}
