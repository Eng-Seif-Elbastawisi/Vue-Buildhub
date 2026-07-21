import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import type TranslationParams from '@/base/Core/Params/translationParams';
import { DepartmentTypeEnum } from '../constants/Type.enum';

export default class EditDepartmentParams implements Params {
  public readonly id: number;
  public readonly translations: TranslationParams;
  public readonly stageId?: number;
  public readonly type: DepartmentTypeEnum;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
    stageId: {
      ...requiredSelectRule(),
      required: (params) => params.type !== DepartmentTypeEnum.DESIGN,
    },
    type: requiredSelectRule(),
  });

  constructor(data: {
    id: number;
    translations: TranslationParams;
    stageId?: number;
    type: DepartmentTypeEnum;
  }) {
    this.id = data.id;
    this.translations = data.translations;
    this.stageId = data.stageId;
    this.type = data.type;
  }

  toMap(): { [p: string]: any } {
    return {
      department_id: this.id,
      translations: this.translations,
      stage_id: this.stageId,
      type: this.type,
    };
  }

  validate() {
    return EditDepartmentParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditDepartmentParams.validation.validateOrThrow(this);
  }
}
