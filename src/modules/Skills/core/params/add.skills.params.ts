import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

/**
 * Parameters for adding a new employee
 */
export default class AddSkillsParams implements Params {
  public translations: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    // translations: { required: true },
  });

  constructor(data: { translations: TranslationParams }) {
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    return {
      translations: this.translations.toMap(),
    };
  }

  validate() {
    return AddSkillsParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddSkillsParams.validation.validateOrThrow(this);
  }
}
