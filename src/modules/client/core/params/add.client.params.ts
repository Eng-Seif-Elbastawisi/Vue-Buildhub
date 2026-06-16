import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class AddClientParams implements Params {
  public phone?: number;
  public name?: string;
  public email?: string;
  public address?: string;
  public static readonly validation = new ClassValidation().setRules({
    phone: { required: true },
    name: { required: true },
    email: { required: true },
    address: { required: true },
  });
  constructor(data: {
    phone?: number;
    name?: string;
    email?: string;
    address?: string; 
  }) {
    this.phone = data.phone;
    this.name = data.name;
    this.email = data.email;
    this.address = data.address;
  }
  toMap(): { [p: string]: any } {
    return {
      phone: this.phone,
      name: this.name,
      email: this.email,
      address: this.address,
    };
  }
  validate() {
    return AddClientParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddClientParams.validation.validateOrThrow(this);
  }
}
