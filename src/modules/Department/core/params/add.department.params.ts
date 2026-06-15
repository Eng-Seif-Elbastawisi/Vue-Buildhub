import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class AddDepartmentParams implements Params {
  public readonly title: string;
  public readonly stageId: number;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true, minLength: 2, maxLength: 100 },
    stageId: { required: true },
  });

  constructor(data: { title: string; stageId: number }) {
    this.title = data.title;
    this.stageId = data.stageId;
  }

  toMap(): Record<string, string | number> {
    return { title: this.title, stage_id: this.stageId };
  }

  validate() {
    return AddDepartmentParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddDepartmentParams.validation.validateOrThrow(this);
  }
}
