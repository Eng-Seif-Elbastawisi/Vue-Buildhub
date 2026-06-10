import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ArticleClarificationParams implements Params {
  public documentId?: number;
  public source?: string;
  public clarification?: string;
  public file?: string[];

  public static readonly validation = new ClassValidation().setRules({
    documentId: { required: true },
    source: { required: true },
    clarification: { required: true },
    file: { required: true },
  });

  constructor(data: {
    documentId?: number;
    source?: string;
    clarification?: string;
    file?: string[];
  }) {
    this.documentId = data.documentId;
    this.source = data.source;
    this.clarification = data.clarification;
    this.file = data.file;
  }

  toMap(): { [p: string]: any } {
    return {
      ...(this.documentId ? { document_id: this.documentId } : {}),
      ...(this.source ? { source: this.source } : {}),
      ...(this.clarification ? { clarification: this.clarification } : {}),
      ...(this.file ? { file: this.file } : {}),
    };
  }

  validate() {
    return ArticleClarificationParams.validation.validate(this);
  }

  validateOrThrow() {
    return ArticleClarificationParams.validation.validateOrThrow(this);
  }
}
