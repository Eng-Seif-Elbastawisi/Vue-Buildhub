import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditWarehouseParams implements Params {
  public warehouseId?: number;
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
  });

  constructor(data: { warehouseId?: number; translations?: TranslationParams }) {
    this.warehouseId = data.warehouseId;
    this.translations = data.translations;
  }

  toMap(): Record<string, unknown> {
    return {
      warehouse_id: this.warehouseId,
      translations: this.translations?.toMap(),
    };
  }

  validate() {
    return EditWarehouseParams.validation.validate(this);
  }
  validateOrThrow() {
    return EditWarehouseParams.validation.validateOrThrow(this);
  }
}
