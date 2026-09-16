import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowProductsParams implements Params {
  public productsId: number;
  public allLocales?: boolean;
  public static readonly validation = new ClassValidation().setRules({
    productsId: { required: true },
  });

  constructor(data: { productsId: number; allLocales?: boolean }) {
    this.productsId = data.productsId;
    this.allLocales = data.allLocales;
  }
  toMap(): Record<string, number> {
    return { product_id: this.productsId };
  }
  validate() {
    return ShowProductsParams.validation.validate(this);
  }
  validateOrThrow() {
    return ShowProductsParams.validation.validateOrThrow(this);
  }
}
