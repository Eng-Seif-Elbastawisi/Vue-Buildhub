import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteWarehouseParams implements Params {
  public warehouseId: number;
  public static readonly validation = new ClassValidation().setRules({
    warehouseId: { required: true },
  });

  constructor(data: { warehouseId: number }) {
    this.warehouseId = data.warehouseId;
  }
  toMap(): Record<string, number> {
    return { warehouse_id: this.warehouseId };
  }
  validate() {
    return DeleteWarehouseParams.validation.validate(this);
  }
  validateOrThrow() {
    return DeleteWarehouseParams.validation.validateOrThrow(this);
  }
}
