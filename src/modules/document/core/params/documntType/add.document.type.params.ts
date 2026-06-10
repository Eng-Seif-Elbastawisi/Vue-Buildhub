import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type DocumentTranslationParams from './translation.params';

export default class AddDocumentTypeParams implements Params {
  public translations: DocumentTranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    translations: { required: true },
  });

  constructor(data: { translations: DocumentTranslationParams }) {
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    return {
      translations: this.translations.toMap(),
    };
  }

  validate() {
    return AddDocumentTypeParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddDocumentTypeParams.validation.validateOrThrow(this);
  }
}
