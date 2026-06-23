import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type LocationTypeEnum } from '../constant/location.type.enum';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditLocationParams implements Params {
  public location_id?: number;
  public parentId?: number;
  public code?: string;
  public type?: LocationTypeEnum;
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    // location_id: { required: true },
    // code: { required: true },
    type: { required: true },
    translations: { required: true },
  });

  constructor(data: {
    location_id?: number;
    parentId?: number;
    code?: string;
    type?: LocationTypeEnum;
    translations?: TranslationParams;
  }) {
    this.location_id = data.location_id;
    this.parentId = data.parentId;
    this.code = data.code;
    this.type = data.type;
    this.translations = data.translations;
  }

  toMap(): Record<string, unknown> {
    const map: Record<string, unknown> = {
      location_id: this.location_id,
      parent_id: this.parentId,
      code: this.code,
      type: this.type,
      translations: this.translations?.toMap(),
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
