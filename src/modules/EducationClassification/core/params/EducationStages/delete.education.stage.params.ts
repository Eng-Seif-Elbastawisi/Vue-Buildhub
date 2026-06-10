import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteEducationStageParams implements Params {
  public stage_id: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { stage_id: number }) {
    this.stage_id = data.stage_id;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      education_classification_branch_id: this.stage_id,
    };
    return map;
  }

  validate() {
    return DeleteEducationStageParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteEducationStageParams.validation.validateOrThrow(this);
  }
}
