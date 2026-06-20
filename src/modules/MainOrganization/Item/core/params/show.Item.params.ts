import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowItemParams implements Params {
  public item_id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    item_id: { required: true },
  });

  constructor(data: { item_id: number; allLocales?: boolean }) {
    this.item_id = data.item_id;
    this.allLocales = data.allLocales;
  }

  toMap(): { [p: string]: number } {
    return { item_id: this.item_id };
  }

  validate() {
    return ShowItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowItemParams.validation.validateOrThrow(this);
  }
}
