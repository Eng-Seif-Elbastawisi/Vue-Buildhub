import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { LocationTypeEnum } from "../constant/location.type.enum";

export default class AddLocationParams implements Params {
  public parentId?: number;
  public type?: LocationTypeEnum;
  public translations?: { title: Record<string, string> };
  public static readonly validation = new ClassValidation().setRules({
    parentId: { required: true },
    type: { required: true },
    translations: { required: true },
  });
  constructor(data: {
    parentId?: number;
    type?: LocationTypeEnum;
    translations?: { title: Record<string, string> };
  }) {
    this.parentId = data.parentId;
    this.type = data.type;
    this.translations = data.translations;
  }
  toMap(): { [p: string]: any } {
    return {
      parent_id: this.parentId,
      type: this.type,
      translations: this.translations,
    };
  }
  validate() {
    return AddLocationParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddLocationParams.validation.validateOrThrow(this);
  }
}
