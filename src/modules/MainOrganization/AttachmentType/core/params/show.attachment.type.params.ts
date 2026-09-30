import type Params from '@/base/Core/Params/params';
import {
  ClassValidation,
  type ValidationResult,
  ValidationError,
} from '@/base/Presentation/Utils/classValidation';

export default class ShowAttachmentTypeParams implements Params {
  public id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(id: number, allLocales: boolean = false) {
    this.id = id;
    this.allLocales = allLocales;
  }

  toMap(): Record<string, unknown> {
    return {
      attachment_type_id: this.id,
    };
  }

  validate(): ValidationResult {
    return ShowAttachmentTypeParams.validation.validate(this);
  }

  validateOrThrow(): void {
    const validation = this.validate();
    if (!validation.isValid) {
      const validationError = new ValidationError(validation.errors);
      validationError.openDialog();
    }
  }
}
