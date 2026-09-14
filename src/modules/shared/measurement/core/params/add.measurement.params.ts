import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

export default class AddMeasurementParams implements Params {
  public translations?: { title: Record<string, string> };
  public parentId?: number;
  public code?: string;
  public symbol?: { title: Record<string, string> };
  public precision?: number;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),

    },
    code: {
      required: true,
      custom: (value) => !!value || translate('validation.code_required'),
    },
    symbol: {
      required: true,
      custom: (value) => !!value || translate('validation.symbol_required'),
    },
    precision: {
      required: true,
      custom: (value) => !!value || translate('validation.precision_required'),
    },
  });

  constructor(data: {
    translations?: { title: Record<string, string> }; parentId?: number; code?: string;
    symbol?: { title: Record<string, string> };
    precision?: number;
  }) {
    this.translations = data.translations;
    this.parentId = data.parentId;
    this.code = data.code;
    this.symbol = data.symbol;
    this.precision = data.precision;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      translations: this.translations,
      code: this.code,
      symbol: this.symbol,
      precision: this.precision,
    };
    if (this.parentId) {
      map.parent_id = this.parentId;
    }
    return map;
  }

  validate() {
    return AddMeasurementParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddMeasurementParams.validation.validateOrThrow(this);
  }
}
