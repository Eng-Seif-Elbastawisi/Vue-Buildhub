import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddSpecializationParams implements Params {
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    // name: { required: true },
    // projectType: { required: true },
    //  translations: { required: true },
  });

  constructor(data: { translations?: TranslationParams }) {
    this.translations = data.translations;
  }

  toMap(): Record<string, unknown> {
    return {
      translations: this.translations?.toMap(),
    };
  }

  validate() {
    return AddSpecializationParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddSpecializationParams.validation.validateOrThrow(this);
  }
}
