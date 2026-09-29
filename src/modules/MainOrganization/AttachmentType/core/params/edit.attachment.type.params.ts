import type Params from '@/base/Core/Params/params';
import {
  ClassValidation,
  type ValidationResult,
  ValidationError,
} from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/base/Core/Params/translationParams';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

export default class EditAttachmentTypeParams implements Params {
  public id: number;
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    translations: {
      required: true,
      custom: (value?: TranslationParams) =>
        hasTitleTranslation(value) || translate('validation.title_required'),
    },
  });

  constructor(data: { id: number; translations?: TranslationParams }) {
    this.id = data.id;
    this.translations = data.translations;
  }

  toMap(): Record<string, unknown> {
    return {
      attachment_type_id: this.id,
      translations: this.translations?.toMap(),
    };
  }

  validate(): ValidationResult {
    return EditAttachmentTypeParams.validation.validate(this);
  }

  validateOrThrow(): void {
    const validation = this.validate();
    if (!validation.isValid) {
      const validationError = new ValidationError(validation.errors);
      validationError.openDialog();
    }
  }
}
