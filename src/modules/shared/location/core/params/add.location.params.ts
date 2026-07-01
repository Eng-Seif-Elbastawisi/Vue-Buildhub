import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type LocationTypeEnum } from '../constant/location.type.enum';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddLocationParams implements Params {
  public parentId?: number;
  public code?: string;
  public type?: LocationTypeEnum;
  public translations?: TranslationParams;
  public static readonly validation = new ClassValidation().setRules({
    // code: { required: true },
    type: { required: true },
    translations: { required: true },
  });
  constructor(data: {
    parentId?: number;
    code?: string;
    type?: LocationTypeEnum;
    translations?: TranslationParams;
  }) {
    this.parentId = data.parentId;
    this.code = data.code;
    this.type = data.type;
    this.translations = data.translations;
  }
  toMap(): Record<string, unknown> {
    return {
      parent_id: this.parentId,
      code: this.code,
      type: this.type,
      translations: this.translations?.toMap(),
    };
  }
  validate() {
    return AddLocationParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddLocationParams.validation.validateOrThrow(this);
  }
}
