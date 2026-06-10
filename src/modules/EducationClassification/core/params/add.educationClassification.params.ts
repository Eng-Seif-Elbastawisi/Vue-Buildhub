import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

/**
 * Parameters for adding a new country
 */
export default class AddEducationClassificationParams implements Params {
  public translation: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    translation: { required: true },
  });

  constructor(data: { translation: TranslationParams }) {
    this.translation = data.translation;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      translations: this.translation.toMap(),
    };
    return map;
  }

  validate() {
    return AddEducationClassificationParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddEducationClassificationParams.validation.validateOrThrow(this);
  }
}
