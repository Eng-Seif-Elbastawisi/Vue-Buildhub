import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowWarehouseParams implements Params {
  public warehouseId: number;
  public allLocales?: boolean;
  public static readonly validation = new ClassValidation().setRules({
    warehouseId: { required: true },
  });

  constructor(data: { warehouseId: number; allLocales?: boolean }) {
    this.warehouseId = data.warehouseId;
    this.allLocales = data.allLocales;
  }
  toMap(): Record<string, number> {
    return { warehouse_id: this.warehouseId };
  }
  validate() {
    return ShowWarehouseParams.validation.validate(this);
  }
  validateOrThrow() {
    return ShowWarehouseParams.validation.validateOrThrow(this);
  }
}
