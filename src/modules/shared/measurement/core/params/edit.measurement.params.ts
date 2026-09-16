import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

/**
 * Parameters for updating an existing country
 */
export default class EditMeasurementParams implements Params {
  public id: number;
  public translations?: { title: Record<string, string>; symbol?: Record<string, string> };
  public code?: string;
  public precision?: number;
  public status?: boolean;

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
    translations?: { title: Record<string, string>; symbol?: Record<string, string> };
    code?: string;
    precision?: number;
    status?: boolean;
  }) {
    this.id = data.id;
    this.translations = data.translations;
    this.code = data.code;
    this.precision = data.precision;
    this.status = data.status;
  }

  toMap(): { [p: string]: any } {
    return {
      measurement_unit_id: this.id,
      translations: this.translations,
      code: this.code,
      precision: this.precision,
      ...(this.status !== undefined ? { status: this.status ? 1 : 0 } : {}),
    };
  }

  validate() {
    return EditMeasurementParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditMeasurementParams.validation.validateOrThrow(this);
  }
}
