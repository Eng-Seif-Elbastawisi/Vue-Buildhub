import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowTaskItemParams implements Params {
  public uuid: string;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    uuid: { required: true },
  });

  constructor(data: { uuid: string; allLocales?: boolean }) {
    this.uuid = data.uuid;
    this.allLocales = data.allLocales;
  }

  toMap(): { [p: string]: string } {
    return { uuid: this.uuid };
  }

  validate() {
    return ShowTaskItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowTaskItemParams.validation.validateOrThrow(this);
  }
}
