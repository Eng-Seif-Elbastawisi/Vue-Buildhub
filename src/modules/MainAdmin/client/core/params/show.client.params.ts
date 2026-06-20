import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowClientParams implements Params {
  public client_id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    client_id: { required: true },
  });

  constructor(data: { client_id: number; allLocales?: boolean }) {
    this.client_id = data.client_id;
    this.allLocales = data.allLocales;
  }

  toMap(): { [p: string]: number } {
    return { client_id: this.client_id };
  }

  validate() {
    return ShowClientParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowClientParams.validation.validateOrThrow(this);
  }
}
