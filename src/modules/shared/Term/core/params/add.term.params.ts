import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddTermParams implements Params {
  public translations: TranslationParams;
  public departmentId: number;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
    departmentId: requiredSelectRule(),
  });

  constructor(data: { translations: TranslationParams; departmentId: number }) {
    this.translations = data.translations;
    this.departmentId = data.departmentId;
  }

  toMap(): Record<string, TranslationParams | number> {
    return { translations: this.translations, department_id: this.departmentId };
  }

  validate() {
    return AddTermParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddTermParams.validation.validateOrThrow(this);
  }
}
