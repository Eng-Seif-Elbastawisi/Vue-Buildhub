import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import isBase64 from '@/base/Presentation/Utils/is_base64';

export default class AttachmentsParams implements Params {
  public alt?: string;
  public file?: string;

  public static readonly validation = new ClassValidation().setRules({
    file: { required: true },
  });

  constructor(data: { alt?: string; file?: string }) {
    this.alt = data.alt;
    this.file = data.file;
  }

  toMap(): { [p: string]: any } {
    return {
      alt: this.alt,
      file: isBase64(this.file) ? this.file : '',
    };
  }

  validate() {
    return AttachmentsParams.validation.validate(this);
  }

  validateOrThrow() {
    return AttachmentsParams.validation.validateOrThrow(this);
  }
}
