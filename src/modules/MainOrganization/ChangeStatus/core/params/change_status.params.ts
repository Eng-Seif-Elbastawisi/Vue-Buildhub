import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { type StatusTypeEnum } from '../constant/change_status.type.enum';

export default class ChangeStatusParams implements Params {
  public typeId?: number;
  public type?: StatusTypeEnum;
  public static readonly validation = new ClassValidation().setRules({
    type_id: requiredSelectRule(),
  });
  constructor(data: {
    typeId?: number;
    type?: StatusTypeEnum;
  }) {
    this.typeId = data.typeId;
    this.type = data.type;
  }
  toMap(): { [p: string]: any } {
    return {
      type_id: this.typeId,
      type: this.type,
    };
  }
  validate() {
    return ChangeStatusParams.validation.validate(this);
  }
  validateOrThrow() {
    return ChangeStatusParams.validation.validateOrThrow(this);
  }
}
