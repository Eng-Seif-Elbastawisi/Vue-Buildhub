import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import { type BrandTypeEnum } from '../constant/Brand.type.enum';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddBrandParams implements Params {
  public translations: TranslationParams;
  public type?: BrandTypeEnum;
  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
    type: requiredSelectRule(),
  });
  constructor(data: { translations: TranslationParams; type?: BrandTypeEnum }) {
    this.translations = data.translations;
    this.type = data.type;
  }
  toMap(): { [p: string]: any } {
    return {
      translations: this.translations,
      type: this.type,
    };
  }
  validate() {
    return AddBrandParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddBrandParams.validation.validateOrThrow(this);
  }
}
