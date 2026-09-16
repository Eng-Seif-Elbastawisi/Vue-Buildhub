import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteProductsSortingParams implements Params {
  public productSortingId: number;

  public static readonly validation = new ClassValidation().setRules({
    productSortingId: { required: true },
  });

  constructor(data: { productSortingId: number }) {
    this.productSortingId = data.productSortingId;
  }

  toMap(): Record<string, number> {
    return {
      product_sorting_id: this.productSortingId,
    };
  }

  validate() {
    return DeleteProductsSortingParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteProductsSortingParams.validation.validateOrThrow(this);
  }
}
