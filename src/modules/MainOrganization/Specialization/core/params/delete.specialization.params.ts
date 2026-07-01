import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteSpecializationParams implements Params {
  public specializationId: number;
  public static readonly validation = new ClassValidation().setRules({
    specializationId: { required: true },
  });

  constructor(data: { specializationId: number }) {
    this.specializationId = data.specializationId;
  }
  toMap(): Record<string, number> {
    return { specialization_id: this.specializationId };
  }
  validate() {
    return DeleteSpecializationParams.validation.validate(this);
  }
  validateOrThrow() {
    return DeleteSpecializationParams.validation.validateOrThrow(this);
  }
}
