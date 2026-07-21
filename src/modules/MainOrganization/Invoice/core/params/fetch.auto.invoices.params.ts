import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class FetchAutoInvoicesParams implements Params {
  public readonly project_id: number;

  public static readonly validation = new ClassValidation().setRules({
    project_id: {
      required: true,
      custom: (projectId) => Number.isInteger(projectId) && projectId > 0,
    },
  });

  constructor(payload: { project_id: number }) {
    this.project_id = payload.project_id;
  }

  toMap(): { project_id: number } {
    return { project_id: this.project_id };
  }

  validate() {
    return FetchAutoInvoicesParams.validation.validate(this);
  }

  validateOrThrow() {
    return FetchAutoInvoicesParams.validation.validateOrThrow(this);
  }
}
