import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type DocumentTranslationTypeParams from './translation.params';

export default class EditDocumentTypeParams implements Params {
  public document_type_id: number;
  public translations: DocumentTranslationTypeParams;

  public static readonly validation = new ClassValidation().setRules({
    document_type_id: { required: true },
    translations: {},
  });

  constructor(data: {
    document_type_id: number;
    translations: DocumentTranslationTypeParams;
  }) {
    this.document_type_id = data.document_type_id;
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    return { 
      document_type_id: this.document_type_id,
      translations: this.translations.toMap(),
    };
  }

  validate() {
    return EditDocumentTypeParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditDocumentTypeParams.validation.validateOrThrow(this);
  }
}
