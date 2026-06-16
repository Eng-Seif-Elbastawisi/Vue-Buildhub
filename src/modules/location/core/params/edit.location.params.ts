import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { LocationTypeEnum } from '../constant/location.type.enum';

export default class EditLocationParams implements Params {
  public location_id?: number;
  public parentId?: number;
  public type?: LocationTypeEnum;
  public translations?: { title: Record<string, string> };

  public static readonly validation = new ClassValidation().setRules({
    location_id: { required: true },
    parentId: { required: true },
    type: { required: true },
    translations: { required: true },
  });

  constructor(data: {
    location_id?: number;
    parentId?: number;
    type?: LocationTypeEnum;
    translations?: { title: Record<string, string> };
  }) {
    this.location_id = data.location_id;
    this.parentId = data.parentId;
    this.type = data.type;
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      location_id: this.location_id,
      parent_id: this.parentId,
      type: this.type,
      translations: this.translations,
    };

    return map;
  }

  validate() {
    return EditLocationParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditLocationParams.validation.validateOrThrow(this);
  }
}