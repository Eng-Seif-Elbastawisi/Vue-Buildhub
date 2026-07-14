import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddSpaceParams implements Params {
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
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
    return AddSpaceParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddSpaceParams.validation.validateOrThrow(this);
  }
}
