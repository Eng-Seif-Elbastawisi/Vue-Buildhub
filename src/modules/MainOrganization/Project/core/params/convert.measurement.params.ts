import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowProjectParams implements Params {
  public projectId: number;
  public allLocales?: boolean;
  public static readonly validation = new ClassValidation().setRules({
    projectId: { required: true },
  });

  constructor(data: { projectId: number; allLocales?: boolean }) {
    this.projectId = data.projectId;
    this.allLocales = data.allLocales;
  }
  toMap(): Record<string, number> {
    return { project_id: this.projectId };
  }
  validate() {
    return ShowProjectParams.validation.validate(this);
  }
  validateOrThrow() {
    return ShowProjectParams.validation.validateOrThrow(this);
  }
}
