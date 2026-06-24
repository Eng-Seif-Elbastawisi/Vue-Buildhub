import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowSpecializationParams implements Params {
  public specializationId: number;
  public allLocales?: boolean;
  public static readonly validation = new ClassValidation().setRules({
    specializationId: { required: true },
  });

  constructor(data: { specializationId: number; allLocales?: boolean }) {
    this.specializationId = data.specializationId;
    this.allLocales = data.allLocales;
  }
  toMap(): Record<string, number> {
    return { specialization_id: this.specializationId };
  }
  validate() {
    return ShowSpecializationParams.validation.validate(this);
  }
  validateOrThrow() {
    return ShowSpecializationParams.validation.validateOrThrow(this);
  }
}
