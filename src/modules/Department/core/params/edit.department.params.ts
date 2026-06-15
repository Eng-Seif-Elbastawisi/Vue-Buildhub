import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class EditDepartmentParams implements Params {
  public readonly id: number;
  public readonly title: string;
  public readonly stageId: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    title: { required: true, minLength: 2, maxLength: 100 },
    stageId: { required: true },
  });

  constructor(data: { id: number; title: string; stageId: number }) {
    this.id = data.id;
    this.title = data.title;
    this.stageId = data.stageId;
  }

  toMap(): Record<string, string | number> {
    return { id: this.id, title: this.title, stage_id: this.stageId };
  }

  validate() {
    return EditDepartmentParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditDepartmentParams.validation.validateOrThrow(this);
  }
}
