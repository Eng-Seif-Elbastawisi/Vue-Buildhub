import type Params from '@/base/Core/Params/params';

import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';

import { translate } from '@/locales/i18n';

import type TranslationParams from '@/base/Core/Params/translationParams';

import { type ItemTypeEnum } from '../constant/item.type.enum';

export default class EditItemTypesParams implements Params {
  public itemTypesId?: number;

  public translations?: TranslationParams;

  public type?: ItemTypeEnum;

  public code?: string;

  public static readonly validation = new ClassValidation().setRules({
    itemTypesId: {
      required: true,
    },

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
    itemTypesId?: number;
    translations?: TranslationParams;
    type?: ItemTypeEnum;
    code?: string;
  }) {
    this.itemTypesId = data.itemTypesId;
    this.translations = data.translations;
    this.type = data.type;
    this.code = data.code;
  }

  toMap(): Record<string, unknown> {
    return {
      item_type_id: this.itemTypesId,
      translations: this.translations?.toMap(),
      type: this.type,
      code: this.code,
    };
  }

  validate() {
    return EditItemTypesParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditItemTypesParams.validation.validateOrThrow(this);
  }
}
