import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class AddTermParams implements Params {
  public readonly title: string;
  public readonly departmentId: number;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true, minLength: 2, maxLength: 100 },
    departmentId: { required: true },
  });

  constructor(data: { title: string; departmentId: number }) {
    this.title = data.title;
    this.departmentId = data.departmentId;
  }

  toMap(): Record<string, string | number> {
    return { title: this.title, department_id: this.departmentId };
  }

  validate() {
    return AddTermParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddTermParams.validation.validateOrThrow(this);
  }
}
