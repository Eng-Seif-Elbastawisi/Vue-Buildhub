import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditSpecializationParams implements Params {
  public specializationId?: number;
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
  });

  constructor(data: { specializationId?: number; translations?: TranslationParams }) {
    this.specializationId = data.specializationId;
    this.translations = data.translations;
  }

  toMap(): Record<string, unknown> {
    return {
      specialization_id: this.specializationId,
      translations: this.translations?.toMap(),
    };
  }

  validate() {
    return EditSpecializationParams.validation.validate(this);
  }
  validateOrThrow() {
    return EditSpecializationParams.validation.validateOrThrow(this);
  }
}
