import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class AddContractorParams implements Params {
  public static readonly validation = new ClassValidation().setRules({
    name: { required: true },
    stageIds: { required: true },
  });

  constructor(
    public name: string,
    public stageIds: number[],
  ) {}

  toMap(): { name: string; stage_ids: number[] } {
    return { name: this.name.trim(), stage_ids: this.stageIds };
  }

  validate() {
    return AddContractorParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddContractorParams.validation.validateOrThrow(this);
  }
}
