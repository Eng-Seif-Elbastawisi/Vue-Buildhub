import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import type TranslationParams from '@/base/Core/Params/translationParams';
import { DepartmentTypeEnum } from '../constants/Type.enum';

export default class AddDepartmentParams implements Params {
  public readonly translations: TranslationParams;
  public readonly stageId?: number;
  public readonly type: DepartmentTypeEnum;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
    stageId: {
      ...requiredSelectRule(),
      required: (params) => params.type !== DepartmentTypeEnum.DESIGN,
    },
  });

  constructor(data: {
    translations: TranslationParams;
    stageId?: number;
    type: DepartmentTypeEnum;
  }) {
    this.translations = data.translations;
    this.stageId = data.stageId;
    this.type = data.type;
  }

  toMap(): { [p: string]: any } {
    return {
      translations: this.translations,
      stage_id: this.stageId,
      type: this.type,
    };
  }

  validate() {
    return AddDepartmentParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddDepartmentParams.validation.validateOrThrow(this);
  }
}
