import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class StoreProductsSortingParams implements Params {
  public productId: number;
  public title: string;
  public price: number;

  public static readonly validation = new ClassValidation().setRules({
    productId: { required: true },
    title: { required: true },
    price: { required: true },
  });

  constructor(data: {
    productId: number;
    title: string;
    price: number;
  }) {
    this.productId = data.productId;
    this.title = data.title;
    this.price = data.price;
  }

  toMap(): Record<string, number | string> {
    return {
      product_id: this.productId,
      title: this.title,
      price: this.price,
    };
  }

  validate() {
    return StoreProductsSortingParams.validation.validate(this);
  }

  validateOrThrow() {
    return StoreProductsSortingParams.validation.validateOrThrow(this);
  }
}

