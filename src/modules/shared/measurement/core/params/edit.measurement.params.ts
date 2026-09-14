import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

/**
 * Parameters for updating an existing country
 */
export default class EditMeasurementParams implements Params {
  public id: number;
  public translations?: { title: Record<string, string> };
  public code?: string;
  public symbol?: { title: Record<string, string> };
  public precision?: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, minLength: 1, maxLength: 100 },
    translations: {
      required: true,
      minLength: 2,
      maxLength: 100,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
  });

  constructor(data: {
    id: number;
    translations?: { title: Record<string, string> };
    code?: string;
    symbol?: { title: Record<string, string> };
    precision?: number;
  }) {
    this.id = data.id;
    this.translations = data.translations;
    this.code = data.code;
    this.symbol = data.symbol;
    this.precision = data.precision;
  }

  toMap(): { [p: string]: any } {
    return {
      measurement_unit_id: this.id,
      translations: this.translations,
      code: this.code,
      symbol: this.symbol,
      precision: this.precision,
    };
  }

  validate() {
    return EditMeasurementParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditMeasurementParams.validation.validateOrThrow(this);
  }
}
