import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
export default class ProjectAttachmentParams implements Params {
  public readonly file: string;
  public readonly alt: string;
  public readonly link: string | null;

   public static readonly validation = new ClassValidation().setRules({
    file: { required: true },
    // alt: { required: true },
    // link: { required: false },
  });
 

  constructor(data: {
    file: string;
    alt: string;
    link?: string | null;
  }) {
    this.file = data.file;
    this.alt = data.alt;
    this.link = data.link ?? null;
  }

  toMap(): Record<string, unknown> {
    return {
      file: this.file,
      alt: this.alt,
      link: this.link,
    };
  }
  validate() {
    return ProjectAttachmentParams.validation.validate(this);
  }

  validateOrThrow() {
    return ProjectAttachmentParams.validation.validateOrThrow(this);
  }
}