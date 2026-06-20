import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteItemParams implements Params {
  public item_id: number;

  public static readonly validation = new ClassValidation().setRules({
    item_id: { required: true },
  });

  constructor(data: { item_id: number }) {
    this.item_id = data.item_id;
  }

  toMap(): { [p: string]: any } {
    return {
      item_id: this.item_id,
    };
  }

  validate() {
    return DeleteItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteItemParams.validation.validateOrThrow(this);
  }
}
