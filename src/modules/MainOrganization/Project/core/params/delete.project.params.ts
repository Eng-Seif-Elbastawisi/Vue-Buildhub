import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteProjectParams implements Params {
  public projectId: number;
  public static readonly validation = new ClassValidation().setRules({
    projectId: { required: true },
  });

  constructor(data: { projectId: number }) {
    this.projectId = data.projectId;
  }
  toMap(): Record<string, number> {
    return { project_id: this.projectId };
  }
  validate() {
    return DeleteProjectParams.validation.validate(this);
  }
  validateOrThrow() {
    return DeleteProjectParams.validation.validateOrThrow(this);
  }
}
