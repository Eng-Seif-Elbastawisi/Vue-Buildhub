
import type Params from '@/base/Core/Params/params';

import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';

import { translate } from '@/locales/i18n';

import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddStageParams implements Params {
  public translations?: TranslationParams;

  public parentId?: number;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) =>
        hasTitleTranslation(value) ||
        translate('validation.title_required'),
    },
  });

  constructor(data: {
    translations?: TranslationParams;
    parentId?: number;
  }) {
    this.translations = data.translations;
    this.parentId = data.parentId;
  }

  toMap(): Record<string, unknown> {
    const map: Record<string, unknown> = {
      translations: this.translations?.toMap(),
    };

    if (this.parentId !== undefined) {
      map.parent_id = this.parentId;
    }

    return map;
  }

  validate() {
    return AddStageParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddStageParams.validation.validateOrThrow(this);
  }
}

