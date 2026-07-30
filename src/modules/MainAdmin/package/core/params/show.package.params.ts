import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowPackageParams implements Params {
  public id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(id: number, allLocales?: boolean) {
    this.id = id;
    this.allLocales = allLocales;
  }

  toMap(): Record<string, number> {
    const params: Record<string, number> = { package_id: this.id };

    return params;
  }

  validate() {
    return ShowPackageParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowPackageParams.validation.validateOrThrow(this);
  }
}
