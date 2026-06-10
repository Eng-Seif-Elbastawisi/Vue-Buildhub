import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class QuestionSourceParams implements Params {
  public documentId: number;
  public source: string;

  public static readonly validation = new ClassValidation().setRules({
    documentId: { required: true },
    source: { required: true },
  });

  constructor(data: { documentId: number; source: string }) {
    this.documentId = data.documentId;
    this.source = data.source;
  }

  toMap(): { [p: string]: any } {
    return {
      document_id: this.documentId,
      text: this.source,
    };
  }

  validate() {
    return QuestionSourceParams.validation.validate(this);
  }

  validateOrThrow() {
    return QuestionSourceParams.validation.validateOrThrow(this);
  }
}
