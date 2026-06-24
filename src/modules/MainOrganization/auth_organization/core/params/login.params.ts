import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for creating/updating employee email
 */
export default class LoginParams implements Params {
  public email: string;
  public password: string;

  public static readonly validation = new ClassValidation().setRules({
    email: { required: true },
    password: { required: true },
  });

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      credentials: this.email,
      password: this.password,
    };

    return map;
  }

  validate() {
    return LoginParams.validation.validate(this);
  }

  validateOrThrow() {
    return LoginParams.validation.validateOrThrow(this);
  }
}
