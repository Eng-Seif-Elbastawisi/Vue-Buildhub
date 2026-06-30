import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteProjectFloorParams implements Params {
  public projectFloorId: number;
  public static readonly validation = new ClassValidation().setRules({
    projectFloorId: { required: true },
  });

  constructor(data: { projectFloorId: number }) {
    this.projectFloorId = data.projectFloorId;
  }
  toMap(): Record<string, number> {
    return { projectFloorId: this.projectFloorId };
  }
  validate() {
    return DeleteProjectFloorParams.validation.validate(this);
  }
  validateOrThrow() {
    return DeleteProjectFloorParams.validation.validateOrThrow(this);
  }
}
