import type Params from '@/base/Core/Params/params';

import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';

import { translate } from '@/locales/i18n';

import type TranslationParams from '@/base/Core/Params/translationParams';

import { type ItemTypeEnum } from '../constant/item.type.enum';

export default class AddItemTypesParams implements Params {
  public translations?: TranslationParams;

  public type?: ItemTypeEnum;

  public code?: string;

  public status?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },

    type: {
      required: true,
    },

    code: {
      required: true,
    },
  });

  constructor(data: {
    translations?: TranslationParams;
    type?: ItemTypeEnum;
    code?: string;
    status?: boolean;
  }) {
    this.translations = data.translations;
    this.type = data.type;
    this.code = data.code;
    this.status = data.status;
  }

  toMap(): Record<string, unknown> {
    return {
      translations: this.translations?.toMap(),
      type: this.type,
      code: this.code,
      status: this.status,
    };
  }

  validate() {
    return AddItemTypesParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddItemTypesParams.validation.validateOrThrow(this);
  }
}
