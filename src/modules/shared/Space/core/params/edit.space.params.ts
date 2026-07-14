import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditSpaceParams implements Params {
  public spaceId?: number;
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
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
