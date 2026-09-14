import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteItemTypesParams implements Params {
  public itemTypesId: number;
  public static readonly validation = new ClassValidation().setRules({
    itemTypesId: { required: true },
  });

  constructor(data: { itemTypesId: number }) {
    this.itemTypesId = data.itemTypesId;
  }
  toMap(): Record<string, number> {
    return { item_type_id: this.itemTypesId };
  }
  validate() {
    return DeleteItemTypesParams.validation.validate(this);
  }
  validateOrThrow() {
    return DeleteItemTypesParams.validation.validateOrThrow(this);
  }
}
