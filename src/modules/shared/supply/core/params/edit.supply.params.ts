import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class EditSupplyParams implements Params {
  public supply_id?: number;
  public price?: number;
  public brandId?: number;
  public measurementId?: number;
  public translations?: { title: Record<string, string> };

  public static readonly validation = new ClassValidation().setRules({
    supply_id: { required: true },
    price: { required: true },
    brandId: { required: true },
    measurementId: { required: true },
    translations: { required: true },
  });

  constructor(data: {
    supply_id?: number;
    price?: number;
    brandId?: number;
    measurementId?: number;
    translations?: { title: Record<string, string> };
  }) {
    this.supply_id = data.supply_id;
    this.price = data.price;
    this.brandId = data.brandId;
    this.measurementId = data.measurementId;
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      supply_id: this.supply_id,
      price: this.price,
      brand_id: this.brandId,
      measurement_unit_id: this.measurementId,
      translations: this.translations,
    };

    return map;
  }

  validate() {
    return EditSupplyParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditSupplyParams.validation.validateOrThrow(this);
  }
}
