import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type BrandTypeEnum } from '../constant/Brand.type.enum';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditBrandParams implements Params {
  public brand_id?: number;
  public readonly translations: TranslationParams;
  public type?: BrandTypeEnum;

  public static readonly validation = new ClassValidation().setRules({
    brand_id: { required: true },
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
