import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

/**
 * Parameters for adding a new country
 */
export default class AddTermsConditionsParams implements Params {
  public translations: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    translations: { required: true, minLength: 1 },
  });

  constructor(data: { translations: TranslationParams }) {
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      translations: this.translations,
    };
    return map;
  }

  validate() {
    return AddTermsConditionsParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddTermsConditionsParams.validation.validateOrThrow(this);
  }
}
