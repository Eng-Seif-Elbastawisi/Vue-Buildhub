import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DocumentTranslationTypeParams implements Params {
  public title: Record<string, string>;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true },
  });

  constructor(data: { title: Record<string, string> }) {
    this.title = data.title;
  }

  toMap(): { [p: string]: any } {
    return {
      title: this.title,
    };
  }

  validate() {
    return DocumentTranslationTypeParams.validation.validate(this);
  }

  validateOrThrow() {
    return DocumentTranslationTypeParams.validation.validateOrThrow(this);
  }
}
