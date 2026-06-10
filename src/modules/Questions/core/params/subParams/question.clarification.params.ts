import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type AttachmentsParams from './attachments.params';

export default class QuestionClarificationParams implements Params {
  public documentId?: number;
  public source?: string;
  public clarification?: string;
  public file?: AttachmentsParams[];

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
    file?: AttachmentsParams[];
  }) {
    this.documentId = data.documentId;
    this.source = data.source;
    this.clarification = data.clarification;
    this.file = data.file;
  }

  toMap(): { [p: string]: any } {
    return {
      document_id: this.documentId,
      source_text: this.source,
      explanation: this.clarification,
      attachments: this.file?.map((f) => f.toMap()),
      // ...(this.file ? { attachments: this.file.map((f) => f.toMap()) } : []),
    };
  }

  validate() {
    return QuestionClarificationParams.validation.validate(this);
  }

  validateOrThrow() {
    return QuestionClarificationParams.validation.validateOrThrow(this);
  }
}
