import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import type { ClientTypeEnum } from '../constant/client.type.enum';

export default class EditClientParams implements Params {
  public client_id?: number;
  public phone?: number;
  public name?: string;
  public email?: string;
  public address?: string;
  public type?: ClientTypeEnum;

  public static readonly validation = new ClassValidation().setRules({
    client_id: { required: true },
    phone: { required: true },
    name: { required: true },
    email: { required: true },
    address: { required: true },
    type: requiredSelectRule(),
  });

  constructor(data: {
    client_id?: number;
    phone?: number;
    name?: string;
    email?: string;
    address?: string;
    type?: ClientTypeEnum;
  }) {
    this.client_id = data.client_id;
    this.phone = data.phone;
    this.name = data.name;
    this.email = data.email;
    this.address = data.address;
    this.type = data.type;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      client_id: this.client_id,
      phone: this.phone,
      name: this.name,
      email: this.email,
      address: this.address,
      type: this.type,
    };

    return map;
  }

  validate() {
    return EditClientParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditClientParams.validation.validateOrThrow(this);
  }
}
