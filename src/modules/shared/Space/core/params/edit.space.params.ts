import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditSpaceParams implements Params {
  public spaceId?: number;
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    // spaceId: { required: true },
    // name: { required: true },
    // projectType: { required: true },
  });

  constructor(data: { spaceId?: number; translations?: TranslationParams }) {
    this.spaceId = data.spaceId;
    this.translations = data.translations;
  }

  toMap(): Record<string, unknown> {
    return {
      space_id: this.spaceId,
      translations: this.translations?.toMap(),
    };
  }

  validate() {
    return EditSpaceParams.validation.validate(this);
  }
  validateOrThrow() {
    return EditSpaceParams.validation.validateOrThrow(this);
  }
}
