import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

export default class AddMeasurementParams implements Params {
  public translations?: { title: Record<string, string>; symbol?: Record<string, string> };
  public parentId?: number;
  public code?: string;
  public precision?: number;
  public status?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },

    code: {
      required: true,
      custom: (value) =>
        !!value || translate('validation.code_required'),
    },

    precision: {
      required: true,
      custom: (value) =>
        (value !== undefined &&
        value !== null &&
        value !== '') ||
        translate('validation.precision_required'),
    },
  });

  constructor(data: {
    translations?: { title: Record<string, string>; symbol?: Record<string, string> };
    parentId?: number;
    code?: string;
    symbol?: { title: Record<string, string> };
    precision?: number;
    status?: boolean;
  }) {
    this.translations = data.translations;
    this.parentId = data.parentId;
    this.code = data.code;
    this.precision = data.precision;
    this.status = data.status;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      translations: this.translations,
      code: this.code,
      precision: this.precision,
    };

    if (this.status !== undefined) {
      map.status = this.status ? 1 : 0;
    }

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