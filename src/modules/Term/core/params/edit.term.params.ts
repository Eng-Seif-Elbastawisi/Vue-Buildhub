import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class EditTermParams implements Params {
  public readonly id: number;
  public readonly title: string;
  public readonly departmentId: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    title: { required: true, minLength: 2, maxLength: 100 },
    departmentId: { required: true },
  });

  constructor(data: { id: number; title: string; departmentId: number }) {
    this.id = data.id;
    this.title = data.title;
    this.departmentId = data.departmentId;
  }

  toMap(): Record<string, string | number> {
    return { id: this.id, title: this.title, department_id: this.departmentId };
  }

  validate() {
    return EditTermParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditTermParams.validation.validateOrThrow(this);
  }
}
