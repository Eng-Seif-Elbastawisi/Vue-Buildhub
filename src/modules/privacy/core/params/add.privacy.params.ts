import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

/**
 * Parameters for adding a new country
 */
export default class AddPrivacyParams implements Params {
  public translations: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    translations: { required: true },
  });

  constructor(data: { translations: TranslationParams }) {
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      translations: this.translations.toMap(),
    };
    return map;
  }

  validate() {
    return AddPrivacyParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddPrivacyParams.validation.validateOrThrow(this);
  }
}
