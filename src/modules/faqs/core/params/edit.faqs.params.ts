import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

export default class EditFaqsParams implements Params {
  public id: number;
  public translations: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(data: {
    id: number;
    translations: TranslationParams;
  }) {

    this.id = data.id;
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    return {
      faq_id: this.id,
      translations: this.translations.toMap(),
    };
  }


  validate() {
    return EditFaqsParams.validation.validate(this);
  }
  validateOrThrow() {
    return EditFaqsParams.validation.validateOrThrow(this);
  }

}
