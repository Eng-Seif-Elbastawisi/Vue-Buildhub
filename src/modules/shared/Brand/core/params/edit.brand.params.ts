import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import { type BrandTypeEnum } from '../constant/Brand.type.enum';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditBrandParams implements Params {
  public brand_id?: number;
  public readonly translations: TranslationParams;
  public type?: BrandTypeEnum;

  public static readonly validation = new ClassValidation().setRules({
    brand_id: { required: true },
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
    type: requiredSelectRule(),
  });

  constructor(data: { brand_id?: number; type?: BrandTypeEnum; translations: TranslationParams }) {
    this.brand_id = data.brand_id;
    this.type = data.type;
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      brand_id: this.brand_id,
      type: this.type,
      translations: this.translations,
    };

    return map;
  }

  validate() {
    return EditBrandParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditBrandParams.validation.validateOrThrow(this);
  }
}
