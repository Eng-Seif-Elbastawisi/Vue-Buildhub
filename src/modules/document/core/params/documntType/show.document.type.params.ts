import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowDocumentTypeParams implements Params {
  public document_type_id: number;
  public isLocale?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    document_type_id: { required: true },
  });

  constructor(data: { document_type_id: number ;isLocale?: boolean}) {
    this.document_type_id = data.document_type_id;
    this.isLocale = data.isLocale;
  }

  toMap(): { [p: string]: any } {
    return {
      document_type_id: this.document_type_id,
    };
  }

  validate() {
    return ShowDocumentTypeParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowDocumentTypeParams.validation.validateOrThrow(this);
  }
}
