import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowPricePercentagesParams implements Params {
  public readonly projectId: number;

  public static readonly validation = new ClassValidation().setRules({
    projectId: {
      required: true,
      custom: (value) => Number.isInteger(value) && value > 0,
    },
  });

  constructor(payload: { projectId: number }) {
    this.projectId = payload.projectId;
  }

  toMap(): { project_id: number } {
    return { project_id: this.projectId };
  }

  validate() {
    return ShowPricePercentagesParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowPricePercentagesParams.validation.validateOrThrow(this);
  }
}
