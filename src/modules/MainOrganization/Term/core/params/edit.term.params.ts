import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditTermParams implements Params {
  public termId?: number;
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
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
