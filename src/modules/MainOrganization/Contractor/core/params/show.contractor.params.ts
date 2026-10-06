import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowContractorParams implements Params {
  public static readonly validation = new ClassValidation().setRules({
    contractorId: { required: true },
  });

  constructor(public contractorId: number) {}

  toMap(): { contractor_id: number } {
    return { contractor_id: this.contractorId };
  }

  validate() {
    return ShowContractorParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowContractorParams.validation.validateOrThrow(this);
  }
}
