import type Params from '@/base/Core/Params/params';
import {
  ClassValidation,
  type ValidationResult,
  ValidationError,
} from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/base/Core/Params/translationParams';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

export default class AddAttachmentTypeParams implements Params {
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value?: TranslationParams) =>
        hasTitleTranslation(value) || translate('validation.title_required'),
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

  validate(): ValidationResult {
    return AddAttachmentTypeParams.validation.validate(this);
  }

  validateOrThrow(): void {
    const validation = this.validate();
    if (!validation.isValid) {
      const validationError = new ValidationError(validation.errors);
      validationError.openDialog();
    }
  }
}
