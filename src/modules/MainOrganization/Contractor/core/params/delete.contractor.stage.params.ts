import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteContractorStageParams implements Params {
  public static readonly validation = new ClassValidation().setRules({
    contractorId: { required: true },
    stageId: { required: true },
  });

  constructor(
    public contractorId: number,
    public stageId: number,
  ) {}

  toMap(): { contractor_id: number; stage_id: number } {
    return { contractor_id: this.contractorId, stage_id: this.stageId };
  }

  validate() {
    return DeleteContractorStageParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteContractorStageParams.validation.validateOrThrow(this);
  }
}
