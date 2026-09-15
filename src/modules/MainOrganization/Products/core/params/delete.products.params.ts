import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteProductsParams implements Params {
  public productsId: number;
  public static readonly validation = new ClassValidation().setRules({
    productsId: { required: true },
  });

  constructor(data: { productsId: number }) {
    this.productsId = data.productsId;
  }
  toMap(): Record<string, number> {
    return { products_id: this.productsId };
  }
  validate() {
    return DeleteProductsParams.validation.validate(this);
  }
  validateOrThrow() {
    return DeleteProductsParams.validation.validateOrThrow(this);
  }
}
