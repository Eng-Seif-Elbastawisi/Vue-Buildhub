import type Params from '@/base/Core/Params/params';

import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';

import { translate } from '@/locales/i18n';

import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditStageParams implements Params {
  public id: number;

  public translations?: TranslationParams;

  public parentId?: number;

  public static readonly validation = new ClassValidation().setRules({
    id: {
      required: true,
      minLength: 1,
      maxLength: 100,
    },

    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
  });

  constructor(data: { id: number; translations?: TranslationParams; parentId?: number }) {
    this.id = data.id;
    this.translations = data.translations;
    this.parentId = data.parentId;
  }

  toMap(): Record<string, unknown> {
    const map: Record<string, unknown> = {
      stage_id: this.id,
      translations: this.translations?.toMap(),
    };

    if (this.parentId !== undefined) {
      map.parent_id = this.parentId;
    }

    return map;
  }

  validate() {
    return EditStageParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditStageParams.validation.validateOrThrow(this);
  }
}
