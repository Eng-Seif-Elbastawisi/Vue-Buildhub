import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowItemTypesParams implements Params {
  public itemTypesId: number;
  public allLocales?: boolean;
  public static readonly validation = new ClassValidation().setRules({
    itemTypesId: { required: true },
  });

  constructor(data: { itemTypesId: number; allLocales?: boolean }) {
    this.itemTypesId = data.itemTypesId;
    this.allLocales = data.allLocales;
  }
  toMap(): Record<string, number> {
    return { item_type_id: this.itemTypesId };
  }
  validate() {
    return ShowItemTypesParams.validation.validate(this);
  }
  validateOrThrow() {
    return ShowItemTypesParams.validation.validateOrThrow(this);
  }
}
