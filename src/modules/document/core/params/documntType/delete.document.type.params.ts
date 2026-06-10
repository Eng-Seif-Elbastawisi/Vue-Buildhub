import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteDocumentTypeParams implements Params {
  public document_id: number;

  public static readonly validation = new ClassValidation().setRules({
    document_id: { required: true },
  });

  constructor(data: { document_id: number }) {
    this.document_id = data.document_id;
  }

  toMap(): { [p: string]: any } {
    return {
      document_type_id: this.document_id,
    };
  }

  validate() {
    return DeleteDocumentTypeParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteDocumentTypeParams.validation.validateOrThrow(this);
  }
}
