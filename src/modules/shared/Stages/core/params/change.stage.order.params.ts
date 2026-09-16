import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for changing stage order
 */
export default class ChangeStageOrderParams implements Params {
  public stageId: number;
  public order: number;

  public static readonly validation = new ClassValidation().setRules({
    stageId: { required: true },
    order: { required: true },
  });

  constructor(data: { stageId: number; order: number }) {
    this.stageId = data.stageId;
    this.order = data.order;
  }

  toMap(): { [p: string]: any } {
    return {
      stage_id: this.stageId,
      order: this.order,
    };
  }

  validate() {
    return ChangeStageOrderParams.validation.validate(this);
  }

  validateOrThrow() {
    return ChangeStageOrderParams.validation.validateOrThrow(this);
  }
}
