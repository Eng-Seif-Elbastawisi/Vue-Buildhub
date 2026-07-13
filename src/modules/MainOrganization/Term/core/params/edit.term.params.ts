import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditTermParams implements Params {
  public termId?: number;
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    // termId: { required: true },
    // name: { required: true },
    // projectType: { required: true },
  });

  constructor(data: { termId?: number; translations?: TranslationParams }) {
    this.termId = data.termId;
    this.translations = data.translations;
  }

  toMap(): Record<string, unknown> {
    return {
      term_id: this.termId,
      translations: this.translations?.toMap(),
    };
  }

  validate() {
    return EditTermParams.validation.validate(this);
  }
  validateOrThrow() {
    return EditTermParams.validation.validateOrThrow(this);
  }
}
