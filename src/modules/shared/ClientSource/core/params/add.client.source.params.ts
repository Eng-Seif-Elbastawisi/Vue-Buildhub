import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

export default class AddClientSourceParams implements Params {
  public translations?: { title: Record<string, string> };
  public parentId?: number;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
  });

  constructor(data: { translations?: { title: Record<string, string> }; parentId?: number }) {
    this.translations = data.translations;
    this.parentId = data.parentId;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      translations: this.translations,
    };
    if (this.parentId) {
      map.parent_id = this.parentId;
    }
    return map;
  }

  validate() {
    return AddClientSourceParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddClientSourceParams.validation.validateOrThrow(this);
  }
}
