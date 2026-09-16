
import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteProductsStageParams implements Params {
  public productId: number;
  public stageIds: number[];

  public static readonly validation = new ClassValidation().setRules({
    productId: { required: true },
    stageIds: { required: true },
  });

  constructor(data: {
    productId: number;
    stageIds: number[];
  }) {
    this.productId = data.productId;
    this.stageIds = data.stageIds;
  }

  toMap(): Record<string, number | number[]> {
    return {
      product_id: this.productId,
      stage_ids: this.stageIds,
    };
  }

  validate() {
    return DeleteProductsStageParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteProductsStageParams.validation.validateOrThrow(this);
  }
}

