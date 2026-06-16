import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteClientParams implements Params {
  public client_id: number;

  public static readonly validation = new ClassValidation().setRules({
    client_id: { required: true },
  });

  constructor(data: { client_id: number }) {
    this.client_id = data.client_id;
  }

  toMap(): { [p: string]: any } {
    return {
      client_id: this.client_id,
    };
  }

  validate() {
    return DeleteClientParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteClientParams.validation.validateOrThrow(this);
  }
}
