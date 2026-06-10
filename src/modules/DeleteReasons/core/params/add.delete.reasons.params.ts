import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

/**
 * Parameters for showing a country
 */
export default class AddDeleteResonsParams implements Params {
  public translations: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { translations: TranslationParams }) {
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {};
    if (this.translations) {
      map['translations'] = this.translations.toMap();
    }

    return map;
  }

  validate() {
    return AddDeleteResonsParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddDeleteResonsParams.validation.validateOrThrow(this);
  }
}
