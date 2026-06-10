import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowPrivacyParams implements Params {
  public allLocales: boolean;
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(data: { id: number; allLocales: boolean }) {
    this.allLocales = data.allLocales;
    this.id = data.id;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      privacy_id: this.id,
    };
    return map;
  }

  validate() {
    return ShowPrivacyParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowPrivacyParams.validation.validateOrThrow(this);
  }
}
