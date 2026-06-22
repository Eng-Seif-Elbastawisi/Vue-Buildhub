import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type BrandTypeEnum } from '../constant/Brand.type.enum';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddBrandParams implements Params {
  public translations: TranslationParams;
  public type?: BrandTypeEnum;
  public static readonly validation = new ClassValidation().setRules({
    translations: { required: true },
    type: { required: false },
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
