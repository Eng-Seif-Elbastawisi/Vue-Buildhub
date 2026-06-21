import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type UnitTypeEnum } from '../constant/unit.type.enum';

export default class AddMaterialsParams implements Params {
  public price?: number;
  public brandId?: number;
  public unit?: UnitTypeEnum;
  public translations?: { title: Record<string, string> };
  public static readonly validation = new ClassValidation().setRules({
    price: { required: true },
    brandId: { required: true },
    unit: { required: true },
    translations: { required: true },
  });
  constructor(data: {
    price?: number;
    brandId?: number;
    unit?: UnitTypeEnum;
    translations?: { title: Record<string, string> };
  }) {
    this.price = data.price;
    this.brandId = data.brandId;
    this.unit = data.unit;
    this.translations = data.translations;
  }
  toMap(): { [p: string]: any } {
    return {
      price: this.price,
      brandId: this.brandId,
      unit: this.unit,
      translations: this.translations,
    };
  }
  validate() {
    return AddMaterialsParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddMaterialsParams.validation.validateOrThrow(this);
  }
}
