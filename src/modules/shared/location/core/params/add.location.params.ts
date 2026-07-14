import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import { type LocationTypeEnum } from '../constant/location.type.enum';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddLocationParams implements Params {
  public parentId?: number;
  public code?: string;
  public type?: LocationTypeEnum;
  public translations?: TranslationParams;
  public static readonly validation = new ClassValidation().setRules({
    // code: { required: true },
    type: requiredSelectRule(),
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
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
