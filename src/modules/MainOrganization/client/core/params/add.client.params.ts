import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { type ClientTypeEnum } from '../constant/client.type.enum';

export default class AddClientParams implements Params {
  public phone?: string;
  public name?: string;
  public email?: string;
  public address?: string;
  public type?: ClientTypeEnum;
  public static readonly validation = new ClassValidation().setRules({
    phone: { required: true },
    name: { required: true },
    email: { required: true },
    address: { required: true },
    type: requiredSelectRule(),
  });
  constructor(data: {
    phone?: string;
    name?: string;
    email?: string;
    address?: string;
    type?: ClientTypeEnum;
  }) {
    this.phone = data.phone;
    this.name = data.name;
    this.email = data.email;
    this.address = data.address;
    this.type = data.type;
  }
  toMap(): { [p: string]: any } {
    return {
      phone: this.phone,
      name: this.name,
      email: this.email,
      address: this.address,
      type: this.type,
    };
  }
  validate() {
    return AddClientParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddClientParams.validation.validateOrThrow(this);
  }
}
