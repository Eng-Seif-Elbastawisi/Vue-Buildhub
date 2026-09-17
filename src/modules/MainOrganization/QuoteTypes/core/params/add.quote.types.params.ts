import type Params from '@/base/Core/Params/params';

import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';

import { translate } from '@/locales/i18n';

import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddQuoteTypeParams implements Params {
  public translations?: TranslationParams;
  public parentId?: number;
  public status?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },

    status: {
      required: true,
    },
  });

  constructor(data: { translations?: TranslationParams; parentId?: number; status?: boolean }) {
    this.translations = data.translations;
    this.parentId = data.parentId;
    this.status = data.status;
  }

  toMap(): Record<string, unknown> {
    const map: Record<string, unknown> = {
      translations: this.translations?.toMap(),
    };

    if (this.parentId !== undefined) {
      map.parent_id = this.parentId;
    }

    if (this.status !== undefined) {
      map.status = this.status;
    }

    return map;
  }

  validate() {
    return AddQuoteTypeParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddQuoteTypeParams.validation.validateOrThrow(this);
  }
}
