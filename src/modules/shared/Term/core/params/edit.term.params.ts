import type Params from '@/base/Core/Params/params';
import type TranslationParams from '@/base/Core/Params/translationParams';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

export default class EditTermParams implements Params {
  public readonly id: number;
  public readonly translations: TranslationParams;
  public readonly departmentId: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
    departmentId: requiredSelectRule(),
  });

  constructor(data: { id: number; translations: TranslationParams; departmentId: number }) {
    this.id = data.id;
    this.translations = data.translations;
    this.departmentId = data.departmentId;
  }

  toMap(): Record<string, TranslationParams | number> {
    return { id: this.id, translations: this.translations, department_id: this.departmentId };
  }

  validate() {
    return EditTermParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditTermParams.validation.validateOrThrow(this);
  }
}
