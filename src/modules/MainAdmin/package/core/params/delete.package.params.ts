import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeletePackageParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(id: number) {
    this.id = id;
  }

  toMap(): Record<string, number> {
    return { package_id: this.id };
  }

  validate() {
    return DeletePackageParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeletePackageParams.validation.validateOrThrow(this);
  }
}
