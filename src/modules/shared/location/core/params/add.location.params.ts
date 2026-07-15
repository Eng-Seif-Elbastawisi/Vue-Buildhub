import type Params from '@/base/Core/Params/params';
import {
  ClassValidation,
  ValidationError,
  type FieldError,
} from '@/base/Presentation/Utils/classValidation';
import {
  hasSelectValue,
  hasTitleTranslation,
  requiredSelectRule,
} from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import {
  LocationTypeEnum,
  type LocationTypeEnum as LocationType,
} from '../constant/location.type.enum';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddLocationParams implements Params {
  public parentId?: number;
  public code?: string;
  public type?: LocationType;
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
    type?: LocationType;
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
    const validationResult = AddLocationParams.validation.validate(this);
    const errors: FieldError[] = [...validationResult.errors];

    if (
      (this.type === LocationTypeEnum.GOVERNORATE || this.type === LocationTypeEnum.CITY) &&
      !hasSelectValue(this.parentId)
    ) {
      errors.push({
        field: 'parentId',
        message: translate('validation.select_required'),
      });
    }

    return { isValid: errors.length === 0, errors };
  }
  validateOrThrow() {
    const validationResult = this.validate();

    if (!validationResult.isValid) {
      new ValidationError(validationResult.errors).openDialog();
    }
  }
}
