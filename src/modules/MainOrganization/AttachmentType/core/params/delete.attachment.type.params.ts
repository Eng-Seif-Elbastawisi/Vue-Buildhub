import type Params from '@/base/Core/Params/params';
import {
  ClassValidation,
  type ValidationResult,
  ValidationError,
} from '@/base/Presentation/Utils/classValidation';

export default class DeleteAttachmentTypeParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(id: number) {
    this.id = id;
  }

  toMap(): Record<string, unknown> {
    return {
      attachment_type_id: this.id,
    };
  }

  validate(): ValidationResult {
    return DeleteAttachmentTypeParams.validation.validate(this);
  }

  validateOrThrow(): void {
    const validation = this.validate();
    if (!validation.isValid) {
      const validationError = new ValidationError(validation.errors);
      validationError.openDialog();
    }
  }
}
