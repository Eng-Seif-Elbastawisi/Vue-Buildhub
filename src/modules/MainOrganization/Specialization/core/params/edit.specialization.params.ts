import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditSpecializationParams implements Params {
  public specializationId?: number;
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    // specializationId: { required: true },
    // name: { required: true },
    // projectType: { required: true },
  });

  constructor(data: { specializationId?: number; translations?: TranslationParams }) {
    this.specializationId = data.specializationId;
    this.translations = data.translations;
  }

  toMap(): Record<string, unknown> {
    return {
      specialization_id: this.specializationId,
      translations: this.translations?.toMap(),
    };
  }

  validate() {
    return EditSpecializationParams.validation.validate(this);
  }
  validateOrThrow() {
    return EditSpecializationParams.validation.validateOrThrow(this);
  }
}
