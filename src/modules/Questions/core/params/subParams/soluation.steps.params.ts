import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type AttachmentsParams from './attachments.params';

export default class SolutionStepsParams implements Params {
  public explanation?: string;
  public image?: AttachmentsParams[];

  public static readonly validation = new ClassValidation().setRules({
    explanation: { required: true },
    image: { required: true },
  });

  constructor(data: { explanation?: string; image?: AttachmentsParams[] }) {
    this.explanation = data.explanation;
    this.image = data.image;
  }

  toMap(): { [p: string]: any } {
    return {
      text: this.explanation,
      attachments: this.image,
    };
  }

  validate() {
    return SolutionStepsParams.validation.validate(this);
  }

  validateOrThrow() {
    return SolutionStepsParams.validation.validateOrThrow(this);
  }
}
